import useSWR from 'swr'
import ky from 'ky'

export const useGods = () => {
  return useSWR<
    Array<{
      name: string
      skins: Array<{ name: string }>
    }>
  >(
    '/api.php?c=gods',
    (
      url: string
    ): Promise<Array<{ name: string; skins: Array<{ name: string }> }>> => {
      return ky.get(url).json()
    }
  )
}
