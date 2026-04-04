const testAuth = async () => {
    try {
        const resReg = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Bob', email: 'bob@bob.com', password: 'bobpass' })
        });
        console.log('Register Res:', resReg.status, await resReg.text());
        
        const resLog = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'bob@bob.com', password: 'bobpass' })
        });
        console.log('Login Res:', resLog.status, await resLog.text());
    } catch(e) {
        console.error(e);
    }
};
testAuth();
