@app
testcors

@http
# simple requests
get /
get /api/foos
post /api/foos

# complex requests
put /api/foos/:fooID
patch /api/foos/:fooID
delete /api/foos/:fooID

@macros
cors

