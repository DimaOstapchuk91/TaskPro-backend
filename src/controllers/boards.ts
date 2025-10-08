export const getUserBoardsController = async (req, res) => {
  res.status(200).json({
    status: 200,
    message: 'Successfully get user boards',
    data: boards,
  });
};

export const createBoardsController = async (req, res) => {
  res.status(200).json({
    status: 200,
    message: 'Create boards successfully ',
    data: boards,
  });
};
