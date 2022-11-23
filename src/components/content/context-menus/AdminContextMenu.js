import React, {useContext} from 'react';
import AppContext from '../../../AppContext';

const AdminContextMenu = ({comment, close}) => {
    const {dispatchAction} = useContext(AppContext);

    const hideComment = () => {
        dispatchAction('hideComment', comment);
        close();
    };

    const showComment = () => {
        dispatchAction('showComment', comment);
        close();
    };

    const isHidden = comment.status !== 'published';

    return (
        <div className="flex flex-col">
            {
                isHidden ?
                    <button type="button" className="w-full text-left text-[14px]" onClick={showComment}>
                        <span>Mostrar </span><span className="hidden sm:inline">comentario</span>
                    </button>
                    :
                    <button type="button" className="w-full text-left text-[14px]" onClick={hideComment}>
                        <span>Ocultar </span><span className="hidden sm:inline">comentario</span>
                    </button>
            }
        </div>
    );
};

export default AdminContextMenu;
