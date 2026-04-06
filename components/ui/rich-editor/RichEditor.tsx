import styles from './RichEditor.module.scss'

type RichEditorProps = {
  content: string;
};

export default function RichEditor({ content }: RichEditorProps) {
  return (
    <div
      className={styles.richEditor}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
