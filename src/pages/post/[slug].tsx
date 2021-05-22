import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { getPrismicClient } from '../../services/prismic';
import Comments from '../../components/Comments';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
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

  const readingTime = () => {
    let countWords: number[] = [];

    const headings = post.data.content.map(c => {
      countWords = countWords.concat(c.body.map(p => p.text.split(' ').length));
      return c.heading.split(' ').length;
    });

    const allTextWords = countWords.concat(headings);
    const wordCount = allTextWords.reduce((acc, w) => acc + w);

    const time = (wordCount / 200) * 100;
    return `${Math.ceil(time / 100)} min`;
  };

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
            <div>
              <h1>{post.data.title}</h1>
              <div className={styles.postInfo}>
                <div>
                  <FiCalendar />
                  <time>
                    {format(
                      new Date(post.first_publication_date),
                      'dd MMM yyyy',
                      { locale: ptBR }
                    )}
                  </time>
                </div>
                <div>
                  <FiUser />
                  <p>{post.data.author}</p>
                </div>
                <div>
                  <FiClock />
                  <p>{readingTime()}</p>
                </div>
              </div>
            </div>
            <div className={styles.postEdit}>
              <p>
                {' '}
                {format(
                  new Date(post.last_publication_date),
                  "'* editado em 'dd MMM yyyy', às 'K':'mm",
                  {
                    locale: ptBR,
                  }
                )}
              </p>
            </div>
          </div>
          <div className={styles.postContent}>
            {post.data.content.map(p => (
              <div className={styles.postParagraph} key={p.heading}>
                <h1>{p.heading}</h1>
                <p
                  dangerouslySetInnerHTML={{ __html: RichText.asHtml(p.body) }}
                />
              </div>
            ))}
          </div>
          <Comments />
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

  const post = {
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
      subtitle: response.data.subtitle,
    },
    uid: response.uid,
  };

  return {
    props: {
      post,
    },
  };
};
