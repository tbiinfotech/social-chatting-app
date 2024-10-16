
const errorHandling = (res,status,message) => {
    return res.status().json(message)
}

module.exports = errorHandling