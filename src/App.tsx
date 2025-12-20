import { AudioPlayer } from './components/AudioPlayer';
import { useState } from 'react';
import { parseBlob } from 'music-metadata';

export default function App() {
    const [audioFiles, setAudioFiles] = useState<File[]>([]);
    const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);

    const handleFolder = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const audio = files.filter((file: File) => file.type.startsWith('audio/'));
        console.log(audio);
        setAudioFiles(audio);
    };

    const handleMp3 = (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>, file: File) => {
        setSelectedAudioFile(file);
    };

    async function getTitle(file: File): Promise<string> {
        const metadata = await parseBlob(file);
        const tags = metadata.common;
        return tags.title || '';
    }

    async function getArtist(file: File): Promise<string> {
        const metadata = await parseBlob(file);
        const tags = metadata.common;
        return tags.artist || '';
    }

    return (
        <div className="app-container">
            <AudioPlayer audioFile={selectedAudioFile} />
            <input type="file" webkitdirectory="true" multiple onChange={handleFolder} />
            <section className="track-list"></section>

            <table className="tabla-zebra">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Titulo</th>
                    </tr>
                </thead>
                <tbody>
                    {audioFiles.map((file, index) => (
                        <tr key={index} onClick={(e) => handleMp3(e, file)}>
                            <td>{index + 1}</td>
                            <td>{file.name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
