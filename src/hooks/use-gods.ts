import useSWR from 'swr'
import ky from 'ky'

type GodsType = Array<{
  id: string
  name: string
  skins: Array<{ id: string; name: string }>
}>

export const useGods = () => {
  return useSWR<GodsType>(
    '/api.php?c=gods',
    (url: string): Promise<GodsType> => {
      return ky.get(url).json()
    }
  )
}
