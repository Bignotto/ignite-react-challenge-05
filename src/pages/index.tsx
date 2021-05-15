import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  // export const Home: React.FC<HomeProps> = ({ postsPagination }: HomeProps) => {
  console.log({ postsPagination });

  return (
    <>
      <Head>
        <title>Spacetraveling</title>
      </Head>
      <main className={commonStyles.container}>
        <div className={styles.posts}>
          {/* post item */}
          <Link href="#">
            <a>
              <h1>Como Utilizar Hooks</h1>
              <p>Pensando em sincronização ao invés de ciclos de vida.</p>
              <div className={styles.postInfo}>
                <div>
                  <FiCalendar />
                  <time>15 Mar 2021</time>
                </div>
                <div>
                  <FiUser />
                  <p>Janco Tiano</p>
                </div>
              </div>
            </a>
          </Link>
          {/* end post item */}
          <Link href="#">
            <a>
              <h1>Como Utilizar Hooks</h1>
              <p>Pensando em sincronização ao invés de ciclos de vida.</p>
              <div className={styles.postInfo}>
                <div>
                  <FiCalendar />
                  <time>15 Mar 2021</time>
                </div>
                <div>
                  <FiUser />
                  <p>Janco Tiano</p>
                </div>
              </div>
            </a>
          </Link>
          <div className={styles.postsFooter}>
            <button type="button">Carregar mais posts</button>
          </div>
        </div>
      </main>
    </>
  );
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);
//   // TODO
// };
