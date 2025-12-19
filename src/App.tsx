import { AudioPlayer } from './components/AudioPlayer';
import { useState } from 'react';

export default function App() {
    const [audioFiles, setAudioFiles] = useState<File[]>([]);
    const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);

    const handleFolder = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const audio = files.filter((file: File) => file.type.startsWith('audio/'));
        console.log(audio);
        setAudioFiles(audio);
    };

    const handleMp3 = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, file: File) => {
        e.preventDefault();
        setSelectedAudioFile(file);
    };

    return (
        <div style={{ padding: 20 }}>
            <input type="file" webkitdirectory="true" multiple onChange={handleFolder} />
            <ul>
                {audioFiles.map((file, index) => (
                    <li key={index}>
                        <a onClick={(e) => handleMp3(e, file)}>{file.name}</a>
                    </li>
                ))}
            </ul>
            <h2>Reproductor MP3 🎧</h2>
            <AudioPlayer audioFile={selectedAudioFile} />
        </div>
    );
}
