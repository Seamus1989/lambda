
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from 'aws-lambda'
import { S3 } from 'aws-sdk'

const bucketName = process.env.PHOTO_BUCKET_NAME as string
const s3 = new S3()

type GeneratedUrl = {
  url: string;
  filename:string;
}
const generateUrl = async (arg: S3.Object, bucket: string):Promise<GeneratedUrl> => {
  const url = await s3.getSignedUrlPromise('getObject', {
    Bucket: bucket,
    Key: arg.Key,
    Expiration: (24 * 60 * 60)
  })
  return {
    filename: arg.Key || 'untitled',
    url
  }
}

const photoLambdaFunction = async (event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyResultV2> => {
  try {
    console.log('The bucket name is ', bucketName)
    if (!bucketName) {
      throw new Error('Cannot find Bucket name!')
    }
    const results = await s3.listObjectsV2({ Bucket: bucketName }).promise()
    if (!results?.Contents) {
      throw new Error('No contents found inside the bucket!')
    }

    const photos = await Promise.all(results?.Contents?.map((result) => generateUrl(result, bucketName)))

    return {
      statusCode: 500,
      body: JSON.stringify(photos)
    }
  } catch (e) {
    console.log(e)
    return {
      statusCode: 500,
      body: `Nooooooooo! Error ${e.message}`
    }
  }
}

export { photoLambdaFunction }
