import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as pdfjsLib from 'pdfjs-dist';
import * as mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import Tesseract from 'tesseract.js';
import axios from 'axios';
import HomeworkDetailsDialog from './HomeworkDetailsDialog';
import { useDispatch, useSelector } from 'react-redux'
import { addMessage, updateLastMessage, clearMessages } from '../reducers/conversationReducer';

// Set up PDF.js worker locally
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const HomeworkUploader = (props) => {
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [ocrProgress, setOcrProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState('');
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [isSubmittingHomework, setIsSubmittingHomework] = useState(false);
  const [homeworkResult, setHomeworkResult] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const addHomeworkUrl = import.meta.env.VITE_ADDHOMEWORK_URL ;
  const {id, userId} = props
  const dispatch = useDispatch();
  

  // Extract text from PDF files (with OCR fallback for image-based PDFs)
  const extractTextFromPDF = async (file) => {
    setProcessingStep('Loading PDF...');
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    let hasTextContent = false;
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      setProcessingStep(`Processing page ${pageNum} of ${pdf.numPages}...`);
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ').trim();
      
      if (pageText.length > 0) {
        // Page has selectable text
        fullText += `--- Page ${pageNum} ---\n${pageText}\n\n`;
        hasTextContent = true;
      } else {
        // Page appears to be image-based, try OCR
        setProcessingStep(`Running OCR on page ${pageNum}...`);
        try {
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;
          
          const imageData = canvas.toDataURL('image/png');
          const ocrResult = await Tesseract.recognize(imageData, 'eng', {
            logger: m => {
              if (m.status === 'recognizing text') {
                setOcrProgress(Math.round(m.progress * 100));
              }
            }
          });
          
          const ocrText = ocrResult.data.text.trim();
          if (ocrText.length > 0) {
            fullText += `--- Page ${pageNum} (OCR) ---\n${ocrText}\n\n`;
          }
        } catch (ocrError) {
          console.warn(`OCR failed for page ${pageNum}:`, ocrError);
          fullText += `--- Page ${pageNum} ---\n[OCR processing failed]\n\n`;
        }
      }
    }
    
    if (!hasTextContent && fullText.trim() === '') {
      throw new Error('No text could be extracted from this PDF. It may be corrupted or contain only images without text.');
    }
    
    return fullText;
  };

  // Extract text from images using OCR
  const extractTextFromImage = async (file) => {
    setProcessingStep('Running OCR on image...');
    setOcrProgress(0);
    
    const result = await Tesseract.recognize(file, 'eng', {
      logger: m => {
        if (m.status === 'recognizing text') {
          setOcrProgress(Math.round(m.progress * 100));
        }
      }
    });
    
    const extractedText = result.data.text.trim();
    if (extractedText.length === 0) {
      throw new Error('No text could be detected in this image. The image may not contain readable text.');
    }
    
    return extractedText;
  };

  // Extract text from Word documents (.docx)
  const extractTextFromWord = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  // Extract text from plain text files
  const extractTextFromPlainText = async (file) => {
    return await file.text();
  };

  // Extract text from Markdown files
  const extractTextFromMarkdown = async (file) => {
    const text = await file.text();
    // Remove basic markdown formatting for cleaner text extraction
    return text
      .replace(/^#{1,6}\s+/gm, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`(.*?)`/g, '$1') // Remove inline code
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
      .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
      .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered lists
      .replace(/^\s*>\s+/gm, '') // Remove blockquotes
      .replace(/\n{3,}/g, '\n\n'); // Clean up extra newlines
  };

  // Extract text from Excel files (as a bonus)
  const extractTextFromExcel = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    let fullText = '';
    
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const sheetText = XLSX.utils.sheet_to_txt(sheet);
      fullText += `--- Sheet: ${sheetName} ---\n${sheetText}\n\n`;
    });
    
    return fullText;
  };

  // Main extraction function that routes to appropriate handler
  const extractTextFromFile = async (file) => {
    try {
      setIsProcessing(true);
      setError('');
      setFileName(file.name);
      setOcrProgress(0);
      setProcessingStep('Analyzing file...');
      
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const mimeType = file.type;
      
      let extractedText = '';
      let detectedFileType = '';

      // Route to appropriate extraction method based on file type
      if (mimeType === 'application/pdf' || fileExtension === 'pdf') {
        extractedText = await extractTextFromPDF(file);
        detectedFileType = 'PDF';
      } else if (
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileExtension === 'docx'
      ) {
        setProcessingStep('Extracting text from Word document...');
        extractedText = await extractTextFromWord(file);
        detectedFileType = 'Word Document';
      } else if (fileExtension === 'md' || fileExtension === 'markdown') {
        setProcessingStep('Processing Markdown file...');
        extractedText = await extractTextFromMarkdown(file);
        detectedFileType = 'Markdown';
      } else if (fileExtension === 'txt' || mimeType === 'text/plain') {
        setProcessingStep('Reading text file...');
        extractedText = await extractTextFromPlainText(file);
        detectedFileType = 'Plain Text';
      } else if (
        mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        fileExtension === 'xlsx' ||
        fileExtension === 'xls'
      ) {
        setProcessingStep('Processing Excel file...');
        extractedText = await extractTextFromExcel(file);
        detectedFileType = 'Excel Spreadsheet';
      } else if (
        mimeType.startsWith('image/') ||
        ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp'].includes(fileExtension)
      ) {
        extractedText = await extractTextFromImage(file);
        detectedFileType = 'Image (OCR)';
      } else {
        // Try to read as plain text for unknown types
        setProcessingStep('Processing as text file...');
        extractedText = await extractTextFromPlainText(file);
        detectedFileType = 'Unknown (treated as text)';
      }

      setFileType(detectedFileType);
      setExtractedText(extractedText);
      setUploadedFile(file);
      setProcessingStep('Complete!');
      
    } catch (err) {
      setError(`Error extracting text: ${err.message}`);
      console.error('Document extraction error:', err);
    } finally {
      setIsProcessing(false);
      setOcrProgress(0);
      setProcessingStep('');
    }
  };

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors.some(error => error.code === 'file-too-large')) {
        setError('File size exceeds 2MB limit. Please upload a smaller file.');
      } else {
        setError('Please upload a supported file type');
      }
      return;
    }

    // Additional size check for accepted files (belt and suspenders approach)
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const maxSizeInBytes = 2 * 1024 * 1024; 
      
      if (file.size > maxSizeInBytes) {
        setError(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the 2MB limit. Please upload a smaller file.`);
        return;
      }
      
      extractTextFromFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md', '.markdown'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp']
    },
    maxFiles: 1,
    multiple: false,
    maxSize: 2 * 1024 * 1024 
  });

  const handleHomeworkSubmit = async (submissionData) => {
    //console.log(submissionData);
    setIsSubmittingHomework(true);
    
    try {
      // Create JSON payload with all necessary data
      const payload = {
        studentInfo: submissionData.studentInfo,
        llmPrompt: submissionData.llmPrompt,
        userId: userId, 
      };

      //console.log(payload)
      
      const notebookId = id;
      
      // Send JSON payload to backend
      const response = await axios.post(`${addHomeworkUrl}/${notebookId}`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      //console.log(response.data.data.content);
      const data = response.data;
      // console.log(data);

      if (data && data.content) {
        dispatch(addMessage({ type: 'response', text: data.content, conversationId: data.conversationId, origin: 'homework'}));
        setShowDetailsDialog(false);
      }

    } catch (err) {
      console.log('Error submitting homework:', err);
      setError('Failed to process homework. Please try again.');
      setShowDetailsDialog(false);
    } finally {
      setIsSubmittingHomework(false);
    }
  };

  const clearResults = () => {
    setExtractedText('');
    setError('');
    setFileName('');
    setFileType('');
    setOcrProgress(0);
    setProcessingStep('');
    setShowDetailsDialog(false);
    setHomeworkResult(null);
    setUploadedFile(null);
  };

  const getSupportedFormats = () => {
    return [
      { type: 'PDF', extensions: '.pdf', description: 'Portable Document Format (with OCR for image-based PDFs)' },
      { type: 'Word', extensions: '.docx', description: 'Microsoft Word Documents' },
      { type: 'Images', extensions: '.jpg, .png, .gif, .bmp, .tiff, .webp', description: 'Image files with OCR text extraction' },
      { type: 'Text', extensions: '.txt', description: 'Plain Text Files' },
      { type: 'Markdown', extensions: '.md, .markdown', description: 'Markdown Files' },
      { type: 'Excel', extensions: '.xlsx, .xls', description: 'Excel Spreadsheets' }
    ];
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Homework Helper</h1>
      
      {/* Homework Result Display */}
      {homeworkResult && (
        <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="text-xl font-semibold text-green-800 mb-4 flex items-center gap-2">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Homework Help Ready!
          </h2>
          
          <div className="bg-white p-4 rounded-lg mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">AI Response:</h3>
            <p className="text-gray-700 mb-4">{homeworkResult.response}</p>
            
            <div className="bg-gray-50 p-3 rounded text-sm">
            
              {/* <p><strong>Subject:</strong> {homeworkResult.submissionData.studentInfo.subject}</p> */}
              <p><strong>Grade:</strong> {homeworkResult.submissionData.studentInfo.gradeLevel}</p>
              <p><strong>Help Type:</strong> {homeworkResult.submissionData.studentInfo.helpType}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setHomeworkResult(null)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Get More Help
            </button>
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      )}
      
      {/* Supported formats info */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Supported File Types:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {getSupportedFormats().map((format, index) => (
            <div key={index} className="text-blue-700">
              <span className="font-medium">{format.type}</span> ({format.extensions}) - {format.description}
            </div>
          ))}
        </div>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isProcessing ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {isDragActive ? (
            <p className="text-blue-600">Drop the document here...</p>
          ) : (
            <div>
              <p className="text-gray-600">Drag and drop a document or image here, or click to select</p>
              <p className="text-sm text-gray-500 mt-1">PDF, Word, Text, Markdown, Excel, and Image files supported</p>
            </div>
          )}
        </div>
      </div>

      {/* Processing indicator */}
      {isProcessing && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-blue-600">Processing document...</span>
          </div>
          {processingStep && (
            <p className="text-sm text-blue-700 text-center">{processingStep}</p>
          )}
          {ocrProgress > 0 && (
            <div className="mt-2">
              <div className="flex justify-between text-sm text-blue-700 mb-1">
                <span>OCR Progress</span>
                <span>{ocrProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${ocrProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
        
      )}

      {/* Results */}
      {extractedText && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Extracted Text from: {fileName}
              </h2>
              <p className="text-sm text-gray-600">File Type: {fileType}</p>
            </div>
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Clear
            </button>
          </div>
          
          <div className="bg-gray-50 border rounded-lg p-4 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
              {extractedText}
            </pre>
          </div>
          
          <div className="mt-4 flex gap-2">
            {/* <button
              onClick={() => navigator.clipboard.writeText(extractedText)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Copy to Clipboard
            </button> */}
            {/* <button
              onClick={() => {
                const blob = new Blob([extractedText], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${fileName.replace(/\.[^/.]+$/, '')}_extracted.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Download Text
            </button> */}
            <button
              onClick={() => setShowDetailsDialog(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors font-semibold"
            >
              Get Homework Help
            </button>
          </div>
        </div>
      )}
      
      {/* Homework Details Dialog */}
      <HomeworkDetailsDialog
        isOpen={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
        onSubmit={handleHomeworkSubmit}
        extractedText={extractedText}
        fileName={fileName}
        fileType={fileType}
        isSubmitting={isSubmittingHomework}
      />
    </div>
  );
};

export default HomeworkUploader;

