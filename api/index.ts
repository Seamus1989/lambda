import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from 'aws-lambda'

const lambdaFunction = async (event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyResultV2> => {
  return {
    statusCode: 200,
    body: 'Its a string'
  }
}

export { lambdaFunction }
