import adapter from '@sveltejs/adapter-node'
import preprocess from 'svelte-preprocess'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: preprocess({}),

  kit: {
    adapter: adapter({
      out: 'build',
      precompress: false,
      env: {
        host: 'MY_HOST_VARIABLE',
        port: 'MY_PORT_VARIABLE',
        origin: 'MY_ORIGINURL',
        headers: {
          protocol: 'MY_PROTOCOL_HEADER',
          host: 'MY_HOST_HEADER',
        },
      },
    }),
  },
}

export default config
