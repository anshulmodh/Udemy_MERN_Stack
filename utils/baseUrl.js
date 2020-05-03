const baseUrl = 
    process.env.NODE_ENV === "production" 
        ? 'https://anshulmodh-react_reserve.now.sh'
        : 'http://localhost:3000' 

export default baseUrl;