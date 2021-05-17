import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  return (
    <div className={commonStyles.container}>
      {router.isFallback ? (
        <h1>Carregando...</h1>
      ) : (
        <>
          <div className={styles.bannerContainer}>
            <img src={post.data.banner.url} alt="banner" />
          </div>
          <div className={styles.postHeader}>
            <h1>{post.data.title}</h1>
            <div className={styles.postInfo}>
              <div>
                <FiCalendar />
                <time>{post.first_publication_date}</time>
              </div>
              <div>
                <FiUser />
                <p>{post.data.author}</p>
              </div>
            </div>
          </div>
          <div className={styles.postContent}>
            {post.data.content.map(p => (
              <>
                <h1>{p.heading}</h1>
                <p dangerouslySetInnerHTML={{ __html: p.body }} />
              </>
            ))}
          </div>
        </>
      )}
    </div> // post container
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const somePosts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 2,
    }
  );
  return {
    paths: [
      {
        params: { slug: somePosts.results[0].uid },
      },
      {
        params: { slug: somePosts.results[1].uid },
      },
    ],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', String(slug), {});

  const postContent = response.data.content.map(c => {
    return {
      heading: c.heading,
      body: RichText.asHtml(c.body),
    };
  });

  const post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      'dd MMM yyyy',
      { locale: ptBR }
    ),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: postContent,
    },
  };

  return {
    props: {
      post,
    },
  };
};
