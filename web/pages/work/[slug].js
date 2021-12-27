import client from '../../client'
import groq from 'groq'
import imageUrlBuilder from '@sanity/image-url'
import BlockContent from '@sanity/block-content-to-react'

function urlFor(source) {
  return imageUrlBuilder(client).image(source)
}

const Work = ({post}) => {
  const {
    title = 'Missing title',  clientName = 'Missing name', clientImage, categories, body = []
  } = post

  return (
    <article>
      <h1>{title}</h1>
      <span>for {clientName}</span>

      {categories && (
        <ul>
          {categories.map(category => <li key={category}>{category}</li>)}
        </ul>
      )}

      {clientImage && (
        <div>
          <img
            src={urlFor(clientImage)
              .width(100)
              .url()}
            alt={`Client Image for ${clientName}`}
          />
        </div>
      )}

      <BlockContent
        blocks={body}
        imageOptions={{ w: 320, h: 240, fit: 'max' }}
        {...client.config()}
      />

      <pre>
      {JSON.stringify(post, null, 4)}
      </pre>
    </article>
  )
}

const QUERY = groq`
*[_type == "work" && slug.current == $slug][0]{
  title,
  "clientName": client->name,
  "clientImage": client->image,
  "categories": categories[]->title,
   body
}
`

export async function getStaticPaths() {
  const paths = await client.fetch(
    `*[_type == "work" && defined(slug.current)][].slug.current`
  )

  return {
    paths: paths.map((slug) => ({params: {slug}})),
    fallback: true,
  }
}

export async function getStaticProps(context) {
  // It's important to default the slug so that it doesn't return "undefined"
  const {slug = ""} = context.params
  const post = await client.fetch(QUERY, {slug})
  return {
    props: {
      post
    }
  }
}

export default Work
