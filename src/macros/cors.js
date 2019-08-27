let toLogicalID = require('@architect/utils/to-logical-id')

module.exports = function cors(arc, template) {

  // expects routes ala @http to decorate with cors headers
  if (arc.cors) {

    // extract the cloudformation template appname
    let appname = toLogicalID(arc.app[0])

    // loop thru the routes
    arc.cors.forEach(route=> {

      // cheesy check for @http style [verb, path] tuples
      if (!Array.isArray(route) || Array.isArray(route) && route.length != 2)
        throw SyntaxError('expected @cors to contain routes (eg. `get /api`')

      let verb = route[0]
      let path = route[1]

      // add headers to the current method
      let paths = template.Resources[appname].Properties.DefinitionBody.paths

      paths[path][verb]['x-amazon-apigateway-integration'].responses.default.responseParameters = {
        'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key'",
        'method.response.header.Access-Control-Allow-Methods': "'*'",
        'method.response.header.Access-Control-Allow-Origin': "'*'" 
      }

      paths[path][verb].responses['200'].headers = {
        'Access-Control-Allow-Headers': {type: 'string'},
        'Access-Control-Allow-Methods': {type: 'string'},
        'Access-Control-Allow-Origin': {type: 'string'}
      }

      // add OPTIONS for preflight to the current path
      paths[path]['options'] = {
        responses: {
          '200': {
            headers: {
              'Access-Control-Allow-Method': {
                schema: {
                  type: 'string'
                }
              },
              'Access-Control-Allow-Origin': {
                schema: {
                  type: 'string'
                }
              },
              "Access-Control-Allow-Credentials": {
                schema: {
                  type: 'string'
                }
              },
              "Access-Control-Allow-Headers": {
                schema: {
                  type: 'string'
                }
              }
            },
            content: {}
          }
        },
        "x-amazon-apigateway-integration": {
          responses: {
            default: {
              statusCode: "200"
            }
          },
          passthroughBehavior: 'when_no_match',
          requestTemplates: {
            'application/json': '{"statusCode": 200}'
          },
          type: 'mock'
        }
      }

    })
  }
  return template
}
