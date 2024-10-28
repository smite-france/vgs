import ky from 'ky'

type FFType = {
  msg: string
  volume: number
  skinId: string
  godId: string
  vgs: Array<{
    name: string
  }>
}

const REGEX_VGS = /^V[A-Z]{1,}[0-9]?$/

export const getSoundForVGS = async (args: FFType): Promise<string> => {
  if (!REGEX_VGS.test(args.msg)) {
    throw new Error('Not a valid VGS message')
  }

  const vgsMatch = args.vgs.find((i) => i.name === args.msg)
  if (vgsMatch === undefined) {
    throw new Error('No VGS match with this message')
  }

  const body = await ky
    .get<{
      sound: string
    }>(`/api.php?c=vgs&m=sound&name=${vgsMatch.name}&id_skin=${args.skinId}`)
    .json()

  return body.sound
}
