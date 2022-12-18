import LeftPane from './LeftPane/LeftPane';
import MainPanel from './MainPanel/MainPanel';
import './App.css';
import PopupList from '../common/PopupList/PopupList';

export default function App() {
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
