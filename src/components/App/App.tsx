import LeftPane from './LeftPane/LeftPane';
import MainPanel from './MainPanel/MainPanel';
import './App.css';
import PopupList from '../common/PopupList/PopupList';
import { useEffect } from 'react';
import { GlobalEvent } from '../../common/event';
import { applyPreferenceAppearance } from '../../common/utils';

export default function App() {
    useEffect(GlobalEvent.initialize(), []);
    useEffect(applyPreferenceAppearance, []);

    const styles = {
        container: {
            backgroundColor: '#0f0f11b5',
        },
    };

    return (
        <div className="app-background">
            <div className="app-container" style={styles.container}>
                <LeftPane />
                <MainPanel />
                <PopupList />
            </div>
        </div>
    );
}
