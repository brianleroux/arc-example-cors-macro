let toLogicalID = require('@architect/utils/to-logical-id')

/** upgrade entire app with cors */
module.exports = function cors(arc, template) {

  // expects routes ala @http to decorate with cors headers
  if (arc.http) {

    // extract the cloudformation template appname
    let appname = toLogicalID(arc.app[0])

    // loop thru the routes
    for (let [verb, path] of arc.http) {
      
      let paths = template.Resources[appname].Properties.DefinitionBody.paths

      // add complex types response headers
      if (verb === 'put' || verb === 'patch' || verb === 'delete') {

        // add headers
        paths[unexpress(path)][verb].responses['200'].headers = {
          'Access-Control-Allow-Methods': {
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
        }

        // add headers values..
        paths[unexpress(path)][verb]['x-amazon-apigateway-integration'].responses.default.responseParameters = {
          'method.response.header.Access-Control-Allow-Headers': "'*'",
          'method.response.header.Access-Control-Allow-Methods': "'*'",
          'method.response.header.Access-Control-Allow-Origin': "'*'",
        }
        paths[unexpress(path)][verb]['x-amazon-apigateway-integration'].responses.default.responseTemplates= {
          'application/json': ''
        }
      }

      // add OPTIONS for preflight to every path
      paths[unexpress(path)]['options'] = {
        responses: {
          '200': {
            headers: {
              'Access-Control-Allow-Methods': {
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
        'x-amazon-apigateway-integration': {
          type: 'mock',
          requestTemplates: {
            'application/json': '{"statusCode":200}'
          },
          contentHandling: "CONVERT_TO_TEXT",
          responses: {
            default: {
              statusCode: '200',
              responseParameters: {
                'method.response.header.Access-Control-Allow-Headers': "'*'",
                'method.response.header.Access-Control-Allow-Methods': "'*'",
                'method.response.header.Access-Control-Allow-Origin': "'*'",
              },
            }
          }
        }
      }

    }//end for
  }//end if
  return template
}

function unexpress(completeRoute) {
  var parts = completeRoute.split('/')
  var better = parts.map(function unexpressPart(part) {
    var isParam = part[0] === ':'
    if (isParam) {
      return `{${part.replace(':', '')}}`
    }
    else {
      return part
    }
  })
  return `${better.join('/')}`
}
