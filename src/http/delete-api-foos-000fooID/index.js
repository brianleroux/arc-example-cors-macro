exports.handler = async function http (req) {
  return {
    headers: {'Access-Control-Allow-Origin': '*'},
    body: JSON.stringify({complex: true})
  }
}
