const { Stack, Duration, RemovalPolicy } = require('aws-cdk-lib');
const apigateway = require('aws-cdk-lib/aws-apigateway');
const lambda = require('aws-cdk-lib/aws-lambda');
const dynamodb = require('aws-cdk-lib/aws-dynamodb');
const cognito = require('aws-cdk-lib/aws-cognito');
const iam = require('aws-cdk-lib/aws-iam');

class MiniDropPixelRoyaleStack extends Stack {
  /**
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    // DynamoDB Tables
    const playerTable = new dynamodb.Table(this, 'PlayerTable', {
      partitionKey: { name: 'playerId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY, // For development only
      tableName: 'MiniDropPlayers'
    });

    const matchTable = new dynamodb.Table(this, 'MatchTable', {
      partitionKey: { name: 'sessionId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY, // For development only
      tableName: 'MiniDropMatches'
    });

    const connectionTable = new dynamodb.Table(this, 'ConnectionTable', {
      partitionKey: { name: 'connectionId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY, // For development only
      tableName: 'MiniDropConnections',
      timeToLiveAttribute: 'ttl'
    });

    const sessionConnectionTable = new dynamodb.Table(this, 'SessionConnectionTable', {
      partitionKey: { name: 'connectionId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY, // For development only
      tableName: 'MiniDropSessionConnections'
    });

    // Add GSI for session connections
    sessionConnectionTable.addGlobalSecondaryIndex({
      indexName: 'SessionIdIndex',
      partitionKey: { name: 'sessionId', type: dynamodb.AttributeType.STRING }
    });

    // Cognito User Pool for anonymous authentication
    const userPool = new cognito.UserPool(this, 'MiniDropUserPool', {
      selfSignUpEnabled: true,
      autoVerify: { email: false, phone: false },
      standardAttributes: {
        email: { required: false, mutable: true }
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: false,
        requireUppercase: false,
        requireDigits: false,
        requireSymbols: false
      },
      removalPolicy: RemovalPolicy.DESTROY // For development only
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'MiniDropUserPoolClient', {
      userPool,
      authFlows: {
        adminUserPassword: true,
        userPassword: true,
        custom: true,
        userSrp: true
      },
      generateSecret: false
    });

    // Lambda Functions
    const lambdaEnvironment = {
      PLAYER_TABLE: playerTable.tableName,
      MATCH_TABLE: matchTable.tableName,
      CONNECTION_TABLE: connectionTable.tableName,
      SESSION_CONNECTION_TABLE: sessionConnectionTable.tableName,
      USER_POOL_ID: userPool.userPoolId,
      USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId
    };

    const lambdaRole = new iam.Role(this, 'MiniDropLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
      ]
    });

    // Grant DynamoDB permissions
    playerTable.grantReadWriteData(lambdaRole);
    matchTable.grantReadWriteData(lambdaRole);
    connectionTable.grantReadWriteData(lambdaRole);
    sessionConnectionTable.grantReadWriteData(lambdaRole);

    // Create Lambda functions
    const createSessionFunction = new lambda.Function(this, 'CreateSessionFunction', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'createSession.handler',
      code: lambda.Code.fromAsset('../backend/functions'),
      environment: lambdaEnvironment,
      timeout: Duration.seconds(10),
      role: lambdaRole
    });

    const joinSessionFunction = new lambda.Function(this, 'JoinSessionFunction', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'joinSession.handler',
      code: lambda.Code.fromAsset('../backend/functions'),
      environment: lambdaEnvironment,
      timeout: Duration.seconds(10),
      role: lambdaRole
    });

    const startGameFunction = new lambda.Function(this, 'StartGameFunction', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'startGame.handler',
      code: lambda.Code.fromAsset('../backend/functions'),
      environment: lambdaEnvironment,
      timeout: Duration.seconds(10),
      role: lambdaRole
    });

    const updatePlayerStateFunction = new lambda.Function(this, 'UpdatePlayerStateFunction', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'updatePlayerState.handler',
      code: lambda.Code.fromAsset('../backend/functions'),
      environment: lambdaEnvironment,
      timeout: Duration.seconds(10),
      role: lambdaRole
    });

    const getSessionStateFunction = new lambda.Function(this, 'GetSessionStateFunction', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'getSessionState.handler',
      code: lambda.Code.fromAsset('../backend/functions'),
      environment: lambdaEnvironment,
      timeout: Duration.seconds(10),
      role: lambdaRole
    });

    const endGameFunction = new lambda.Function(this, 'EndGameFunction', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'endGame.handler',
      code: lambda.Code.fromAsset('../backend/functions'),
      environment: lambdaEnvironment,
      timeout: Duration.seconds(10),
      role: lambdaRole
    });

    const getPlayerStatsFunction = new lambda.Function(this, 'GetPlayerStatsFunction', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'getPlayerStats.handler',
      code: lambda.Code.fromAsset('../backend/functions'),
      environment: lambdaEnvironment,
      timeout: Duration.seconds(10),
      role: lambdaRole
    });

    // WebSocket functions
    const websocketConnectFunction = new lambda.Function(this, 'WebSocketConnectFunction', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'websocketConnect.handler',
      code: lambda.Code.fromAsset('../backend/functions'),
      environment: lambdaEnvironment,
      timeout: Duration.seconds(10),
      role: lambdaRole
    });

    const websocketDisconnectFunction = new lambda.Function(this, 'WebSocketDisconnectFunction', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'websocketDisconnect.handler',
      code: lambda.Code.fromAsset('../backend/functions'),
      environment: lambdaEnvironment,
      timeout: Duration.seconds(10),
      role: lambdaRole
    });

    const websocketMessageFunction = new lambda.Function(this, 'WebSocketMessageFunction', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'websocketMessage.handler',
      code: lambda.Code.fromAsset('../backend/functions'),
      environment: {
        ...lambdaEnvironment,
        WEBSOCKET_ENDPOINT: 'to-be-updated-after-deployment'
      },
      timeout: Duration.seconds(10),
      role: lambdaRole
    });

    // REST API
    const api = new apigateway.RestApi(this, 'MiniDropAPI', {
      restApiName: 'Mini Drop Pixel Royale API',
      description: 'API for Mini Drop: Pixel Royale game',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS
      }
    });

    // API Resources and Methods
    const sessions = api.root.addResource('sessions');
    sessions.addMethod('POST', new apigateway.LambdaIntegration(createSessionFunction));

    const sessionResource = sessions.addResource('{sessionId}');
    sessionResource.addMethod('GET', new apigateway.LambdaIntegration(getSessionStateFunction));

    const joinResource = sessionResource.addResource('join');
    joinResource.addMethod('POST', new apigateway.LambdaIntegration(joinSessionFunction));

    const startResource = sessionResource.addResource('start');
    startResource.addMethod('POST', new apigateway.LambdaIntegration(startGameFunction));

    const updateResource = sessionResource.addResource('update');
    updateResource.addMethod('POST', new apigateway.LambdaIntegration(updatePlayerStateFunction));

    const endResource = sessionResource.addResource('end');
    endResource.addMethod('POST', new apigateway.LambdaIntegration(endGameFunction));

    const players = api.root.addResource('players');
    const playerResource = players.addResource('{playerId}');
    playerResource.addMethod('GET', new apigateway.LambdaIntegration(getPlayerStatsFunction));

    // WebSocket API
    const webSocketApi = new apigateway.WebSocketApi(this, 'MiniDropWebSocketAPI', {
      connectRouteOptions: {
        integration: new apigateway.WebSocketLambdaIntegration('ConnectIntegration', websocketConnectFunction)
      },
      disconnectRouteOptions: {
        integration: new apigateway.WebSocketLambdaIntegration('DisconnectIntegration', websocketDisconnectFunction)
      },
      defaultRouteOptions: {
        integration: new apigateway.WebSocketLambdaIntegration('DefaultIntegration', websocketMessageFunction)
      }
    });

    const webSocketStage = new apigateway.WebSocketStage(this, 'MiniDropWebSocketStage', {
      webSocketApi,
      stageName: 'prod',
      autoDeploy: true
    });

    // Update WebSocket endpoint in Lambda environment
    const webSocketEndpoint = `${webSocketApi.apiId}.execute-api.${this.region}.amazonaws.com/${webSocketStage.stageName}`;
    websocketMessageFunction.addEnvironment('WEBSOCKET_ENDPOINT', webSocketEndpoint);

    // Grant WebSocket management permissions
    websocketMessageFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: ['execute-api:ManageConnections'],
      resources: [`arn:aws:execute-api:${this.region}:${this.account}:${webSocketApi.apiId}/${webSocketStage.stageName}/POST/@connections/*`]
    }));

    // Outputs
    this.exportValue(api.url, { name: 'MiniDropAPIEndpoint' });
    this.exportValue(webSocketEndpoint, { name: 'MiniDropWebSocketEndpoint' });
    this.exportValue(userPool.userPoolId, { name: 'MiniDropUserPoolId' });
    this.exportValue(userPoolClient.userPoolClientId, { name: 'MiniDropUserPoolClientId' });
  }
}

module.exports = { MiniDropPixelRoyaleStack };
