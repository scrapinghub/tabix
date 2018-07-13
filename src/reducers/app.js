import appConst from '../constants/app';

const initialState = {
    darkTheme: true,
    userConnection: {},
    init: false,
    autorized: false
};

export default (state = initialState, action) => {
    switch (action.type) {
    case appConst.ENABLE_DARK_THEME:
        return { ...state, darkTheme: action.payload };
    case appConst.SET_USER_CONNECTION:
        return { ...state, userConnection: action.payload };
    case appConst.USER_AUTHORIZED:
        return { ...state, autorized: action.payload };
    case appConst.USER_LOGOUT:
        return { ...state, autorized: false };
    case appConst.INIT_APP:
        return { ...state, init: true };
    }
    return state;
};
