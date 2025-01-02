import FileListItem from "@/components/drag-and-drop/FileListItem";

interface FileListDragDropProps {
    files: File[];
    onDelete: (file: File) => void;
}

export default function ({files, onDelete}: FileListDragDropProps) {
    return (
        <div>
            {(files ?? []).length > 0 && (
                <div>
                    <h4>Selected Files:</h4>
                    <ul>
                        {files.map((file, index) => (
                            <li key={index}>
                                <FileListItem file={file} onDelete={onDelete} />
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}