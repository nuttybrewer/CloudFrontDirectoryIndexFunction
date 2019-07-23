# CloudFrontJWTValidator
Small LamdaAtEdge function that checks for a Cognito JWT token to be present

nodejs/ contains the actual
CloudFormation/ contains the CF template to deploy the function into AWS.

The packaged zip file must be uploaded to an S3 bucket for the CF template to work

```
