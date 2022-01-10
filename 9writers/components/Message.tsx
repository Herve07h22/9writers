import { Message } from "../web3-api/getMessages";
import Image from "next/image";
import styles from "../styles/Message.module.css";

export const MessageBox: React.FC<Message> = ({
  content,
  authorAddress,
  avatar,
}) => {
  return (
    <div className={styles.message}>
      <div className={styles.content}>{content}</div>

      <div className={styles.footer}>
        <div className={styles.author}>{authorAddress}</div>
        <div className={styles.avatar}>
          <Image src={avatar} alt="avatar" width="30" height="30" />
        </div>
      </div>
    </div>
  );
};
