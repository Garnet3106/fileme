import { preferences } from '../../../../preferences';
import { variables as tabBarVariables } from '../../MainPanel/TabBar/TabBar';
import './ItemMenu.css';

export const variables = {
    itemIconSize: 15,
};

export default function ItemMenu() {
    const styles = {
        top: {
            borderColor: preferences.appearance.border1,
            height: tabBarVariables.height,
        },
        group: {
            borderColor: preferences.appearance.border1,
        },
        itemIcon: {
            height: variables.itemIconSize,
            width: variables.itemIconSize,
        },
    };

    return (
        <div className="item-menu-container">
            <div className="item-menu-top" style={styles.top}>
            </div>
            <div className="item-menu-group" style={styles.group}>
                <div className="item-menu-item">
                    <div className="item-menu-item-icon" style={styles.itemIcon} />
                    <div className="item-menu-item-text">
                        Folder1
                    </div>
                </div>
                <div className="item-menu-item">
                    <div className="item-menu-item-icon" style={styles.itemIcon} />
                    <div className="item-menu-item-text">
                        Folder2
                    </div>
                </div>
                <div className="item-menu-item">
                    <div className="item-menu-item-icon" style={styles.itemIcon} />
                    <div className="item-menu-item-text">
                        Folder3
                    </div>
                </div>
            </div>
        </div>
    );
}