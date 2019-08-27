@app
testcors

@aws
bucket cf-sam-deployments-east

@http
get /
get /foo

# register the macro
@macros
cors

# custom config for the macro
@cors
get /foo
