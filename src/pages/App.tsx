import { AudioPlayer } from '../components/AudioPlayer.tsx';
import ConfigsModal from '../components/ConfigsModal.tsx';
import { useState } from 'react';
import { parseBlob } from 'music-metadata';
import { type AudioFile } from '../types/metadata.ts';
import music_placeholder from '../assets/music_placeholder.png';

export default function App() {
    const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
    const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
    const [configsModalOpen, setConfigsModalOpen] = useState(true);

    const sortByArtist = () => {
        setAudioFiles((prev) =>
            [...prev].sort((a, b) => {
                const artistA = a.artist?.toLowerCase() || '';
                const artistB = b.artist?.toLowerCase() || '';
                return artistA.localeCompare(artistB);
            }),
        );
    };

    const sortByTitle = () => {
        setAudioFiles((prev) =>
            [...prev].sort((a, b) => {
                const titleA = a.title?.toLowerCase() || '';
                const titleB = b.title?.toLowerCase() || '';
                return titleA.localeCompare(titleB);
            }),
        );
    };

    const handleFolder = async (e: React.ChangeEvent<HTMLInputElement>) => {
        let files = Array.from(e.target.files || []);
        files = files.filter((file: File) => file.type.startsWith('audio/'));

        const audioFilesWithMetadata = await Promise.all(
            files.map(async (file) => {
                const metadata = await parseBlob(file);
                const tags = metadata.common;
                return {
                    file,
                    title: tags.title,
                    artist: tags.artist,
                    album: tags.album,
                    picture: tags.picture?.[0]
                        ? {
                              data: Array.from(tags.picture[0].data),
                              format: tags.picture[0].format,
                          }
                        : undefined,
                };
            }),
        );

        setAudioFiles(audioFilesWithMetadata);
        sortByArtist();
        setConfigsModalOpen(false);
    };

    const handleMp3 = (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>, file: File) => {
        e.preventDefault();
        setSelectedAudioFile(file);
    };

    return (
        <div className="app-container">
            {configsModalOpen && (
                <ConfigsModal isOpen={configsModalOpen} onClose={() => setConfigsModalOpen(false)}>
                    <h2>Select your music folder</h2>
                    <input
                        className="input-file"
                        type="file"
                        webkitdirectory="true"
                        multiple
                        onChange={handleFolder}
                    />
                </ConfigsModal>
            )}
            <AudioPlayer
                audioFile={selectedAudioFile}
                setConfigsModalOpen={setConfigsModalOpen}
                audioFiles={audioFiles}
                audioFilesIndex={audioFiles.findIndex((af) => af.file === selectedAudioFile)}
                setSelectedAudioFile={setSelectedAudioFile}
            />

            <section className="track-list">
                <table className="tabla-zebra">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th> </th>
                            <th onClick={sortByArtist}>Artista</th>
                            <th onClick={sortByTitle}>Titulo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {audioFiles.map((audioFile, index) => (
                            <tr key={index} onClick={(e) => handleMp3(e, audioFile.file)}>
                                <td>{index + 1}</td>
                                <td>
                                    <img
                                        className="cover-table"
                                        src={
                                            audioFile.picture
                                                ? URL.createObjectURL(
                                                      new Blob(
                                                          [new Uint8Array(audioFile.picture.data)],
                                                          { type: audioFile.picture.format },
                                                      ),
                                                  )
                                                : music_placeholder
                                        }
                                    />
                                </td>
                                <td>{audioFile.artist ? audioFile.artist : audioFile.file.name}</td>
                                <td>{audioFile.title}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}
