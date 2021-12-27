// client.js
import sanityClient from '@sanity/client'

export default sanityClient({
  projectId: 'z1x141zg', // you can find this in sanity.json
  dataset: 'production', // or the name you chose in step 1
  apiVersion: '2021-03-05', // use a UTC date string
  useCdn: true // `false` if you want to ensure fresh data
})
