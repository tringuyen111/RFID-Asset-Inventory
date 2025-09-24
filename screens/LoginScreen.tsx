
import React, { useState } from 'react';
import { useNavigation } from '../App';
import { login } from '../services/api';
import Layout from '../components/Layout';

const LoginScreen: React.FC = () => {
    const { resetTo } = useNavigation();
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('password');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        setError('');
        const success = await login(username, password);
        if (success) {
            resetTo('home');
        } else {
            setError('Sai tên đăng nhập/mật khẩu, vui lòng thử lại.');
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            <div className="flex flex-col justify-center items-center h-full px-8 bg-white">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome</h1>
                <p className="text-gray-500 mb-12">Login to your account</p>
                
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <div className="w-full mb-4">
                    <label className="text-gray-600 text-sm font-semibold mb-2 block">Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your username"
                    />
                </div>
                <div className="w-full mb-8">
                     <label className="text-gray-600 text-sm font-semibold mb-2 block">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your password"
                    />
                </div>
                <button
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="w-full bg-[#4A43EC] text-white py-3 rounded-lg font-semibold text-lg hover:bg-opacity-90 transition-colors disabled:bg-gray-400 flex justify-center items-center"
                >
                    {isLoading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : (
                        'Đăng nhập'
                    )}
                </button>
            </div>
        </Layout>
    );
};

export default LoginScreen;
