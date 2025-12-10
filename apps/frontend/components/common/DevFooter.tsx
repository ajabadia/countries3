export default function DevFooter({ filePath }: { filePath: string }) {
    const isDev = process.env.NODE_ENV === 'development';

    if (!isDev) return null;

    return (
        <div className="dev-footer">
            <span className="dev-footer-text">{filePath}</span>
        </div>
    );
}
