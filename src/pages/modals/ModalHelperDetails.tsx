import React from 'react';
import {
    IonModal
} from '@ionic/react';
import './ModalHelperDetails.css';
import Card from '../../components/dnex-card/card';
import { Helper } from '../../models/Helper';

interface ModalHelperDetailsProps {
    isOpen: boolean;
    onDidDismiss: () => void;
    helper: Helper | null;
}

const ModalHelperDetails: React.FC<ModalHelperDetailsProps> = ({
    isOpen,
    onDidDismiss,
    helper
}) => {
    if (!helper) return null;

    return (
        <IonModal 
            isOpen={isOpen} 
            onDidDismiss={onDidDismiss}
            className="card-only-modal"
        >
            {/* <div 
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent'
                }}
                onClick={onDidDismiss} // Close when clicking anywhere
            >
                <Card helper={helper} onClick={() => {}} />
            </div> */}
            <Card helper={helper} onClose={onDidDismiss} onClick={() => {}} />
        </IonModal>
    );
};

export default ModalHelperDetails;
