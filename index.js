// Comment
exports.handler = async (event, context, callback) => {
    const cfrequest = event.Records[0].cf.request;
    const headers = cfrequest.headers;
    const uri = cfrequest.uri;
    let whitelist = [];
    if (process.env.WHITELIST) {
      console.log(process.env.WHITELIST);
      whitelist = JSON.parse(process.env.WHITELIST);
    }
    whitelist.forEach(item => {
        var re = new RegExp(item);
        if (re.test(uri)) {
            callback(null, cfrequest)
            return true;
        }
    });

    const response = {
        statusCode: 401,
        statusDescription: 'Unauthorized'
    };
    callback(null, response)
    return response;
};
