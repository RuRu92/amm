import '../styles/globals.css'
import {AppProps} from 'next/app'

function MyApp({Component, pageProps}) {

    return (
        <>
            <div id="root">
                <Component {...pageProps} />
            </div>
        </>
    )
}

export default MyApp
