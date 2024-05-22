import Spinner from "./Spinner"

export function TranscribeButton(props){
    const { isModelLoading, isTranscribing, onClick, ...buttonProps } = props;
    return (
        <button
            {...buttonProps}
            onClick={(event) => {
                if (onClick && !isTranscribing && !isModelLoading) {
                    onClick(event);
                }
            }}
            disabled={isTranscribing}
            className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center'
        >
            {isModelLoading ? (
                <Spinner text={"Loading model..."} />
            ) : isTranscribing ? (
                <Spinner text={"Transcribing..."} />
            ) : (
                "Transcribe Audio"
            )}
        </button>
    );
}