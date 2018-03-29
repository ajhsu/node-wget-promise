interface OnProgress {
  fileSize: number,
  downloadedSize: number,
  percentage: number,
}

export declare function wget(url: string, options: {onStart?: (headers: any) => void, onProgress?: (on: OnProgress) => void, output?: string} = {})

exports.wget = wget
