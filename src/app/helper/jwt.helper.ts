export function isTokenExpired(token: string): boolean {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    //splits only payload in the array of header,payload,singature from jwt token
    //atob decodes it from base 64 
    //json.parese converts decoded string into javascript object
    
    const expiry = payload.exp;
    const now = Math.floor(Date.now() / 1000);
    return expiry < now;
  } catch (e) {
    return true;
  }
}