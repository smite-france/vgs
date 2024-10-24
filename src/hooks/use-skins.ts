import useSWR from 'swr'
import ky from 'ky'

type SkinsType = Array<{
  id: string
  id_god: string
  name: string
}>

export const useSkins = () => {
  return useSWR<SkinsType>(
    '/api.php?c=skins',
    (url: string): Promise<SkinsType> => {
      return ky.get(url).json()
    }
  )
}
