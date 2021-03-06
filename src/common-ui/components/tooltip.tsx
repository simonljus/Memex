import * as React from 'react'
import classNames from 'classnames'

const styles = require('./tooltip.css')

export interface Props {
    children: React.ReactNode
    position: string
    itemClass?: string
    toolTipType?: string
}

class Tooltip extends React.PureComponent<Props> {
    render() {
        return (
            <span
                className={classNames(styles.tooltip, {
                    [styles.searchBar]: this.props.toolTipType === 'searchBar',
                })}
            >
                <div
                    className={classNames(
                        styles.tooltipBubble,
                        this.props.itemClass,
                        {
                            [styles.tooltipleft]:
                                this.props.position === 'left',
                            [styles.tooltipright]:
                                this.props.position === 'right',
                            [styles.tooltipbottom]:
                                this.props.position === 'bottom',
                            [styles.tooltiptop]: 
                                this.props.position === 'top',
                            [styles.tooltipDate]: 
                                this.props.position === 'tooltipDate',
                            [styles.tooltipBottomLeft]: 
                                this.props.position === 'bottomLeft',
                        },
                    )}
                >
                    <div className={classNames(
                        styles.tooltipContent, {
                            [styles.tooltipContentDate]: 
                                this.props.position === 'tooltipDate',
                        })}
                    >
                        {this.props.children}
                    </div>
                </div>
            </span>
        )
    }
}

export default Tooltip
