import * as React from 'react'

import { TagInput } from '../components'
import AllModesFooter from './all-modes-footer'
import * as constants from '../comment-box/constants'
import { getLocalStorage } from 'src/util/storage'
import { TAG_SUGGESTIONS_KEY } from 'src/constants'

const styles = require('./edit-mode-content.css')

interface Props {
    env?: 'inpage' | 'overview'
    comment?: string
    tags: string[]
    handleCancelOperation: () => void
    handleEditAnnotation: (commentText: string, tagsInput: string[]) => void
}

interface State {
    commentText: string
    tagsInput: string[]
    rows: number
    isTagInputActive: boolean
    tagSuggestions: string[]
}

class EditModeContent extends React.Component<Props, State> {
    private _textAreaRef: HTMLElement = null

    state = {
        commentText: this.props.comment ? this.props.comment : '',
        tagsInput: this.props.tags ? this.props.tags : [],
        rows: constants.NUM_DEFAULT_ROWS,
        isTagInputActive: false,
        tagSuggestions: [],
    }

    async componentWillMount() {
        const tagSuggestions = await getLocalStorage(TAG_SUGGESTIONS_KEY, [])
        this.setState({ tagSuggestions: tagSuggestions.reverse() })
    }

    componentDidMount() {
        if (this._textAreaRef) {
            if (this.state.commentText.length !== 0) {
                this.setState({ rows: constants.NUM_MIN_ROWS })
            }
            this._textAreaRef.focus()

            this._textAreaRef.addEventListener('scroll', (e: UIEvent) => {
                const targetElement = e.target as HTMLElement

                let { rows: numRows } = this.state
                while (
                    targetElement.scrollTop &&
                    numRows < constants.NUM_MAX_ROWS
                ) {
                    numRows += 1
                }

                if (numRows !== this.state.rows) {
                    this.setState({ rows: numRows })
                }

                this._textAreaRef.focus()
            })
        }
    }

    private _setTextAreaRef = (ref: HTMLElement) => {
        this._textAreaRef = ref
    }

    private _handleEditAnnotation = () => {
        const { commentText, tagsInput } = this.state
        this.props.handleEditAnnotation(commentText, tagsInput)
    }

    private _handleTextAreaKeyDown = (
        e: React.KeyboardEvent<HTMLTextAreaElement>,
    ) => {
        // Save comment.
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            this._handleEditAnnotation()
        } else if (e.key === 'Tab' && !e.shiftKey) {
            this._setTagInputActive(true)
        } else if (
            this.props.env === 'inpage' &&
            !(e.ctrlKey || e.metaKey) &&
            /[a-zA-Z0-9-_ ]/.test(String.fromCharCode(e.keyCode))
        ) {
            e.preventDefault()
            e.stopPropagation()
            this.setState(state => ({ commentText: state.commentText + e.key }))
        }
    }

    private _handleTagInputKeydown = (
        e: React.KeyboardEvent<HTMLDivElement>,
    ) => {
        // Only check for `Tab` and `Shift + Tab`, handle rest of the events normally.
        if (e.key === 'Tab') {
            this._setTagInputActive(false)
        }
    }

    private _handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        e.preventDefault()
        e.stopPropagation()

        const commentText = e.target.value
        const rows =
            commentText.length === 0
                ? constants.NUM_DEFAULT_ROWS
                : Math.max(this.state.rows, constants.NUM_MIN_ROWS)

        this.setState({ rows, commentText })
    }

    private _setTagInputActive = (isTagInputActive: boolean) => {
        this.setState({ isTagInputActive })
    }

    private _addTag = (tag: string) => {
        this.setState(prevState => ({
            tagsInput: [tag, ...prevState.tagsInput],
        }))
    }

    private _deleteTag = (tag: string) => {
        const tagIndex = this.state.tagsInput.indexOf(tag)
        if (tagIndex !== -1) {
            this.setState(prevState => ({
                tagsInput: [
                    ...prevState.tagsInput.slice(0, tagIndex),
                    ...prevState.tagsInput.slice(tagIndex + 1),
                ],
            }))
        }
    }

    render() {
        return (
            <React.Fragment>
                <textarea
                    rows={this.state.rows}
                    className={styles.textArea}
                    value={this.state.commentText}
                    placeholder="Add your comment... (save with cmd/ctrl+enter)"
                    onClick={() => this._setTagInputActive(false)}
                    onChange={this._handleChange}
                    onKeyDown={this._handleTextAreaKeyDown}
                    ref={this._setTextAreaRef}
                />

                <div onKeyDown={this._handleTagInputKeydown}>
                    <TagInput
                        env={this.props.env}
                        tags={this.state.tagsInput}
                        initTagSuggestions={[
                            ...new Set([
                                ...this.state.tagsInput,
                                ...this.state.tagSuggestions,
                            ]),
                        ]}
                        isTagInputActive={this.state.isTagInputActive}
                        setTagInputActive={this._setTagInputActive}
                        addTag={this._addTag}
                        deleteTag={this._deleteTag}
                    />
                </div>

                <AllModesFooter
                    mode="edit"
                    handleCancelEdit={this.props.handleCancelOperation}
                    handleEditAnnotation={this._handleEditAnnotation}
                />
            </React.Fragment>
        )
    }
}

export default EditModeContent
