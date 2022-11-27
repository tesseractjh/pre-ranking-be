import AuthController from '@controllers/AuthController';
import UserController from '@controllers/UserController';

const updateRefreshToken = async (userId: number) => {
  try {
    const newRefreshToken = AuthController.createRefreshToken(userId);
    await UserController.updateById(userId, { refresh_token: newRefreshToken });
    return newRefreshToken;
  } catch {
    return null;
  }
};

export default updateRefreshToken;
