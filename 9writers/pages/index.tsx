import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Wall.module.css";

const Wall: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>9writers</title>
        <meta name="description" content="9 writers can write on this wall" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.wall}>
        <div className={styles.graffiti}>
          <p>
            Life <del>sucks</del> <ins>is good</ins>
          </p>
          <p>New</p>
        </div>
      </div>
      <div className={styles.walk}>
        <div className={styles.line}></div>
        <div className={styles.line}></div>
        <div className={styles.line}></div>
        <div className={styles.line}></div>
        <div className={styles.line}></div>
      </div>
      <div className={styles.grass}></div>
    </div>
  );
};

export default Wall;
