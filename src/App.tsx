/* Basic tester app */ 
import { ChatApp } from '../src/lib/ChatApp'
import Setup from './utils/setup'
import React, { useState, useEffect } from 'react'
import { WakuLight } from 'js-waku/lib/interfaces'
import { Web3Provider } from '@ethersproject/providers'
import { RLNInstance } from '@waku/rln'
import { getAddress } from './utils/connectWallet'


export default function App() {
    const [waku, setWaku] = useState<WakuLight>()
    const [provider, setProvider] = useState<Web3Provider>()
    const [rlnInstance, setRlnInstance] = useState<RLNInstance>()
    const [alias, setAlias] = useState<string>()

    useEffect(() => {
        (async () => {
            const { waku, provider, rlnInstance } =  await Setup()
            setWaku(waku)
            setProvider(provider)
            setRlnInstance(rlnInstance)
        })()
      }, [])

    // get stored alias or use pub key
    useEffect(() => {
        (async () => {
            const storedAlias = window.localStorage.getItem("alias")
            setAlias(storedAlias ?? await getAddress(provider))
        })()
    })

    // if alias changes, set in local storage
    useEffect(() => {
        localStorage.setItem("alias", alias)
    }, [alias])

    
    
    console.log(`Setup: rlnInstance = ${rlnInstance}`)
    const zkChat = new ChatApp('zkChat', waku, provider, rlnInstance)  
    // const rlnCreds = await zkChat.userRegistration()
    return (
        <>
        </>
    )
}