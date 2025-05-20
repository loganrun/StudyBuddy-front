import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from "./Button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "./DialogContent";
import { Input } from "./Input";
import { Label } from "./Label";
import { cn } from "../../lib/utils";

const DownloadSources = () => {
    const [open, setOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState('');

    const allowedFileTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/markdown'
    ];

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setError('');

        if (file) {
            if (allowedFileTypes.includes(file.type)) {
                setSelectedFile(file);
            } else {
                setError('Please select a valid file type (PDF, DOCX, TXT, or Markdown)');
                setSelectedFile(null);
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file to upload');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setOpen(false);
                setSelectedFile(null);
                // You can add a success notification here
            } else {
                setError('Failed to upload file. Please try again.');
            }
        } catch (err) {
            setError('An error occurred while uploading the file.');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Document
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                    <DialogDescription>
                        Select a document to upload. Supported file types: PDF, DOCX, TXT, and Markdown.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="file-upload">Choose a file</Label>
                        <Input
                            id="file-upload"
                            type="file"
                            accept=".pdf,.docx,.txt,.md"
                            onChange={handleFileChange}
                            className={cn(
                                "cursor-pointer",
                                selectedFile && "border-green-500"
                            )}
                        />
                    </div>

                    {selectedFile && (
                        <div className="text-sm text-muted-foreground">
                            Selected file: {selectedFile.name}
                        </div>
                    )}

                    {error && (
                        <div className="text-sm text-destructive">
                            {error}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={!selectedFile}
                    >
                        Upload
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DownloadSources;
