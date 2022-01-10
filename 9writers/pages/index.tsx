import type { NextPage } from "next";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import { MessageBox } from "../components/Message";
import styles from "../styles/Wall.module.css";
import { getMessages, Message } from "../web3-api/getMessages";

const Wall: NextPage<{ messages: Message[] }> = ({ messages }) => {
  console.log(messages);
  return (
    <div className={styles.container}>
      <Head>
        <title>9writers</title>
        <meta name="description" content="9 writers can write on this wall" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.menu}>
        <Link href="/">
          <div className={styles.logo}>9writers</div>
        </Link>
        <Link href="/write">write</Link>
      </div>
      <div className={styles.wall}>
        <div className={styles.wrapper}>
          {(messages || []).map((message, i) => (
            <MessageBox key={`message-${i}`} {...message} />
          ))}
        </div>
      </div>
      <div className={styles.footer}>
        <Link href="/about">About this project</Link>
      </div>
    </div>
  );
};

export async function getStaticProps() {
  const messages = getMessages();
  console.log(messages);
  return {
    props: { messages }, // will be passed to the page component as props
  };
}

export default Wall;
