import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

import { useTwitchStore } from '@/store/twitch'

export const AuthTwitchCallback = () => {
  const navigate = useNavigate()
  const { hash } = useLocation()
  const setToken = useTwitchStore((s) => s.setToken)
  const [isValid, setIsValid] = useState<undefined | boolean>(undefined)

  useEffect(() => {
    const parsedHash = new URLSearchParams(hash.substring(1))
    const token = parsedHash.get('access_token')
    if (token !== null) {
      setToken(token)
      setIsValid(true)
      navigate('/')
    } else {
      setIsValid(false)
    }
  }, [hash, navigate, setToken])

  if (isValid === undefined) {
    return <div>Processing ...</div>
  }

  if (isValid) {
    return <div>Redirecting ...</div>
  }

  return <div>There is an error contact administrator</div>
}
