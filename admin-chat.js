/* =========================================================
   TOLUWANI COUTURE — ADMIN CHAT
   STAGE 9
   Supabase authentication + conversation inbox
   + messages + admin replies
   + open / close conversation status
   + realtime synchronization
   + unread / new message indicators
   + new message notifications
   ========================================================= */


/* =========================================================
   SUPABASE
   ========================================================= */

const SUPABASE_URL =
    "https://istbncxutptjguijzfqq.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_uZOo6VslQBSy5pn-RoK_pA_K6URSPSZ";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =========================================================
   STATE
   ========================================================= */

let currentConversation = null;

let chatMessagesChannel = null;

let conversationChannel = null;


/*
 * Conversations that currently have new visitor messages.
 *
 * This is intentionally kept in memory for Stage 8.
 * No database changes are required yet.
 */

let unreadConversationIds =
    new Set();


/*
 * Stage 9 notification state.
 */

let notificationTimeout = null;


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const adminLoginScreen =
    document.getElementById(
        "adminLoginScreen"
    );

const adminChatPage =
    document.getElementById(
        "adminChatPage"
    );

const adminLoginForm =
    document.getElementById(
        "adminLoginForm"
    );

const adminEmail =
    document.getElementById(
        "adminEmail"
    );

const adminPassword =
    document.getElementById(
        "adminPassword"
    );

const adminLoginButton =
    document.getElementById(
        "adminLoginButton"
    );

const adminLoginError =
    document.getElementById(
        "adminLoginError"
    );

const adminLogoutButton =
    document.getElementById(
        "adminLogoutButton"
    );

const conversationList =
    document.getElementById(
        "conversationList"
    );

const conversationCount =
    document.getElementById(
        "conversationCount"
    );

const activeChatPanel =
    document.querySelector(
        ".active-chat-panel"
    );


/*
 * Stage 9 notification elements.
 */

const adminMessageNotification =
    document.getElementById(
        "adminMessageNotification"
    );

const adminMessageNotificationText =
    document.getElementById(
        "adminMessageNotificationText"
    );

const adminMessageNotificationClose =
    document.getElementById(
        "adminMessageNotificationClose"
    );


/* =========================================================
   INITIALISE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initialiseAdminChat
);


async function initialiseAdminChat() {

    try {

        const {
            data: {
                session
            },
            error
        } =
            await supabaseClient.auth.getSession();


        if (error) {

            console.error(
                "Session error:",
                error
            );

            showLoginScreen(
                "Unable to check your session."
            );

            return;
        }


        if (!session) {

            showLoginScreen();

            return;
        }


        const isAdmin =
            await verifyAdmin(
                session.user.id
            );


        if (!isAdmin) {

            await supabaseClient.auth.signOut();

            showLoginScreen(
                "This account is not authorised to access the admin chat."
            );

            return;
        }


        showAdminDashboard();

        await loadConversations();

        setupRealtime();

        setupNotificationControls();

    } catch (error) {

        console.error(
            "Admin initialisation error:",
            error
        );

        showLoginScreen(
            "Something went wrong while loading the admin chat."
        );
    }
}


/* =========================================================
   VERIFY ADMIN
   ========================================================= */

async function verifyAdmin(
    userId
) {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("chat_admins")
            .select("user_id")
            .eq(
                "user_id",
                userId
            )
            .maybeSingle();


    if (error) {

        console.error(
            "Admin verification error:",
            error
        );

        return false;
    }


    return !!data;
}


/* =========================================================
   LOGIN
   ========================================================= */

adminLoginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const email =
            adminEmail.value.trim();

        const password =
            adminPassword.value;


        if (!email || !password) {

            showLoginError(
                "Please enter your email and password."
            );

            return;
        }


        adminLoginButton.disabled = true;

        adminLoginButton.textContent =
            "Signing In...";

        clearLoginError();


        try {

            const {
                data,
                error
            } =
                await supabaseClient.auth
                    .signInWithPassword({
                        email,
                        password
                    });


            if (error) {

                showLoginError(
                    error.message
                );

                return;
            }


            if (!data.user) {

                showLoginError(
                    "Unable to sign in."
                );

                return;
            }


            const isAdmin =
                await verifyAdmin(
                    data.user.id
                );


            if (!isAdmin) {

                await supabaseClient.auth.signOut();

                showLoginError(
                    "This account is not authorised to access the admin chat."
                );

                return;
            }


            adminEmail.value = "";

            adminPassword.value = "";


            showAdminDashboard();

            await loadConversations();

            setupRealtime();

            setupNotificationControls();

        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            showLoginError(
                "Something went wrong while signing in."
            );

        } finally {

            adminLoginButton.disabled =
                false;

            adminLoginButton.textContent =
                "Sign In";
        }

    }
);


/* =========================================================
   LOGIN SCREEN
   ========================================================= */

function showLoginScreen(
    message = ""
) {

    cleanupRealtime();

    currentConversation =
        null;

    unreadConversationIds.clear();

    hideMessageNotification();

    adminLoginScreen.hidden =
        false;

    adminChatPage.hidden =
        true;


    if (message) {

        showLoginError(
            message
        );

    } else {

        clearLoginError();
    }
}


function showAdminDashboard() {

    adminLoginScreen.hidden =
        true;

    adminChatPage.hidden =
        false;
}


function showLoginError(
    message
) {

    adminLoginError.textContent =
        message;
}


function clearLoginError() {

    adminLoginError.textContent =
        "";
}


/* =========================================================
   LOGOUT
   ========================================================= */

adminLogoutButton.addEventListener(
    "click",
    async function () {

        cleanupRealtime();

        currentConversation =
            null;

        unreadConversationIds.clear();

        hideMessageNotification();

        await supabaseClient.auth.signOut();

        showLoginScreen();
    }
);


/* =========================================================
   LOAD CONVERSATIONS
   ========================================================= */

async function loadConversations() {

    conversationList.innerHTML = `
        <div class="conversation-empty">

            <i class="fa-regular fa-comments"></i>

            <strong>
                Loading conversations...
            </strong>

            <p>
                Please wait.
            </p>

        </div>
    `;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("chat_conversations")
            .select(`
                id,
                visitor_id,
                visitor_name,
                visitor_email,
                status,
                created_at,
                updated_at,
                last_message_at
            `)
            .order(
                "last_message_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Conversation loading error:",
            error
        );


        conversationList.innerHTML = `
            <div class="conversation-empty">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <strong>
                    Unable to load conversations
                </strong>

                <p>
                    ${escapeHtml(
                        error.message
                    )}
                </p>

            </div>
        `;


        conversationCount.textContent =
            "0";


        return;
    }


    conversationCount.textContent =
        data.length;


    if (!data.length) {

        conversationList.innerHTML = `
            <div class="conversation-empty">

                <i class="fa-regular fa-comments"></i>

                <strong>
                    No conversations yet
                </strong>

                <p>
                    Visitor conversations will appear here.
                </p>

            </div>
        `;

        return;
    }


    conversationList.innerHTML =
        "";


    data.forEach(
        conversation => {

            const item =
                createConversationItem(
                    conversation
                );


            conversationList.appendChild(
                item
            );
        }
    );


    /*
     * Keep the currently open conversation selected
     * after the inbox refreshes.
     */

    if (currentConversation) {

        const selectedItem =
            document.querySelector(
                `.conversation-item[data-conversation-id="${currentConversation.id}"]`
            );


        if (selectedItem) {

            selectedItem.classList.add(
                "is-selected"
            );
        }
    }
}


/* =========================================================
   CONVERSATION ITEM
   ========================================================= */

function createConversationItem(
    conversation
) {

    const item =
        document.createElement(
            "button"
        );


    item.type =
        "button";


    item.className =
        "conversation-item";


    item.dataset.conversationId =
        conversation.id;


    /*
     * Add unread state when this conversation
     * has received a new visitor message.
     */

    if (
        unreadConversationIds.has(
            Number(conversation.id)
        )
    ) {

        item.classList.add(
            "is-unread"
        );
    }


    const initials =
        getInitials(
            conversation.visitor_name
        );


    const date =
        formatConversationDate(
            conversation.last_message_at
        );


    item.innerHTML = `
        <span class="conversation-avatar">

            ${escapeHtml(
                initials
            )}

        </span>


        <span class="conversation-item-content">

            <strong>

                ${escapeHtml(
                    conversation.visitor_name
                )}

            </strong>


            <span>

                ${escapeHtml(
                    conversation.visitor_email
                )}

            </span>


            <small>

                ${escapeHtml(
                    date
                )}

            </small>

        </span>


        ${
            unreadConversationIds.has(
                Number(conversation.id)
            )
                ? `
                    <span class="conversation-unread-badge">
                        NEW
                    </span>
                `
                : ""
        }


        <span
            class="conversation-status ${
                conversation.status === "open"
                    ? "is-open"
                    : "is-closed"
            }"
        >

            ${escapeHtml(
                conversation.status
            )}

        </span>
    `;


    item.addEventListener(
        "click",
        function () {

            openConversation(
                conversation
            );

        }
    );


    return item;
}


/* =========================================================
   OPEN CONVERSATION
   ========================================================= */

async function openConversation(
    conversation
) {

    /*
     * Opening a conversation means the admin
     * has now seen its new messages.
     */

    unreadConversationIds.delete(
        Number(conversation.id)
    );


    /*
     * If this conversation is the one shown
     * in the notification, dismiss it.
     */

    hideMessageNotification();


    currentConversation =
        conversation;


    document
        .querySelectorAll(
            ".conversation-item"
        )
        .forEach(
            item => {

                item.classList.remove(
                    "is-selected"
                );

                if (
                    Number(
                        item.dataset.conversationId
                    ) ===
                    Number(conversation.id)
                ) {

                    item.classList.remove(
                        "is-unread"
                    );

                }

            }
        );


    const selectedItem =
        document.querySelector(
            `.conversation-item[data-conversation-id="${conversation.id}"]`
        );


    if (selectedItem) {

        selectedItem.classList.add(
            "is-selected"
        );

        selectedItem.classList.remove(
            "is-unread"
        );


        const unreadBadge =
            selectedItem.querySelector(
                ".conversation-unread-badge"
            );


        if (unreadBadge) {

            unreadBadge.remove();

        }
    }


    /* -----------------------------------------------------
       MOBILE CHAT VIEW
       ----------------------------------------------------- */

    if (window.innerWidth <= 700) {

        const dashboard =
            document.querySelector(
                ".admin-chat-dashboard"
            );


        if (dashboard) {

            dashboard.classList.add(
                "mobile-chat-open"
            );
        }
    }


    /* -----------------------------------------------------
       LOADING STATE
       ----------------------------------------------------- */

    activeChatPanel.innerHTML = `
        <div class="active-chat-empty">

            <div class="active-chat-empty-icon">

                <i class="fa-regular fa-comments"></i>

            </div>


            <span class="admin-section-eyebrow">
                CONVERSATION
            </span>


            <h2>
                Loading Chat...
            </h2>


            <p>

                Loading messages from
                ${escapeHtml(
                    conversation.visitor_name
                )}.

            </p>

        </div>
    `;


    /* -----------------------------------------------------
       LOAD MESSAGES
       ----------------------------------------------------- */

    const {
        data: messages,
        error
    } =
        await supabaseClient
            .from("chat_messages")
            .select(`
                id,
                conversation_id,
                sender_id,
                sender_type,
                message,
                created_at
            `)
            .eq(
                "conversation_id",
                conversation.id
            )
            .order(
                "created_at",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "Message loading error:",
            error
        );


        activeChatPanel.innerHTML = `
            <div class="active-chat-empty">

                <div class="active-chat-empty-icon">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                </div>


                <span class="admin-section-eyebrow">
                    CONVERSATION
                </span>


                <h2>
                    Unable to Load Chat
                </h2>


                <p>

                    ${escapeHtml(
                        error.message
                    )}

                </p>

            </div>
        `;


        return;
    }


    renderConversation(
        conversation,
        messages
    );
}


/* =========================================================
   RENDER ACTIVE CONVERSATION
   ========================================================= */

function renderConversation(
    conversation,
    messages
) {

    const isOpen =
        conversation.status === "open";


    activeChatPanel.innerHTML = `

        <div class="admin-active-chat">


            <!-- CHAT HEADER -->

            <header class="admin-active-chat-header">


                <button
                    type="button"
                    class="admin-mobile-back"
                    id="adminMobileBack"
                    aria-label="Back to conversations"
                >

                    <i class="fa-solid fa-arrow-left"></i>

                </button>


                <div class="admin-active-chat-person">


                    <span class="admin-active-chat-avatar">

                        ${escapeHtml(
                            getInitials(
                                conversation.visitor_name
                            )
                        )}

                    </span>


                    <div>

                        <strong>

                            ${escapeHtml(
                                conversation.visitor_name
                            )}

                        </strong>


                        <span>

                            ${escapeHtml(
                                conversation.visitor_email
                            )}

                        </span>

                    </div>

                </div>


                <div class="admin-active-chat-actions">

                    <span
                        class="conversation-status ${
                            isOpen
                                ? "is-open"
                                : "is-closed"
                        }"
                    >

                        ${escapeHtml(
                            conversation.status
                        )}

                    </span>


                    <button
                        type="button"
                        class="admin-conversation-status-button ${
                            isOpen
                                ? "is-close-action"
                                : "is-open-action"
                        }"
                        id="conversationStatusButton"
                    >

                        <i class="fa-solid ${
                            isOpen
                                ? "fa-lock"
                                : "fa-lock-open"
                        }"></i>

                        <span>
                            ${
                                isOpen
                                    ? "Close"
                                    : "Reopen"
                            }
                        </span>

                    </button>

                </div>


            </header>


            <!-- MESSAGES -->

            <div
                class="admin-active-chat-messages"
                id="adminChatMessages"
            >

                ${
                    messages.length

                        ? messages
                            .map(
                                message =>
                                    createAdminMessage(
                                        message
                                    )
                            )
                            .join("")

                        : `

                            <div class="admin-chat-no-messages">

                                <i class="fa-regular fa-message"></i>

                                <strong>
                                    No messages yet
                                </strong>

                                <p>
                                    This conversation has not received a message yet.
                                </p>

                            </div>

                        `
                }

            </div>


            <!-- ADMIN REPLY FORM -->

            <form
                class="admin-chat-reply-form"
                id="adminChatReplyForm"
            >

                <input
                    type="text"
                    id="adminChatReplyInput"
                    name="message"
                    placeholder="${
                        isOpen
                            ? "Write a reply..."
                            : "Conversation is closed"
                    }"
                    autocomplete="off"
                    ${
                        isOpen
                            ? "required"
                            : "disabled"
                    }
                >


                <button
                    type="submit"
                    id="adminChatReplyButton"
                    aria-label="Send message"
                    ${
                        isOpen
                            ? ""
                            : "disabled"
                    }
                >

                    <i class="fa-solid fa-paper-plane"></i>

                </button>

            </form>


        </div>
    `;


    /* =====================================================
       STATUS BUTTON
       ===================================================== */

    const statusButton =
        document.getElementById(
            "conversationStatusButton"
        );


    if (statusButton) {

        statusButton.addEventListener(
            "click",
            async function () {

                await updateConversationStatus(
                    conversation
                );

            }
        );
    }


    /* =====================================================
       MOBILE BACK BUTTON
       ===================================================== */

    const mobileBackButton =
        document.getElementById(
            "adminMobileBack"
        );


    if (mobileBackButton) {

        mobileBackButton.addEventListener(
            "click",
            function () {

                const dashboard =
                    document.querySelector(
                        ".admin-chat-dashboard"
                    );


                if (dashboard) {

                    dashboard.classList.remove(
                        "mobile-chat-open"
                    );
                }

            }
        );
    }


    /* =====================================================
       ADMIN REPLY FORM
       ===================================================== */

    const replyForm =
        document.getElementById(
            "adminChatReplyForm"
        );


    const replyInput =
        document.getElementById(
            "adminChatReplyInput"
        );


    const replyButton =
        document.getElementById(
            "adminChatReplyButton"
        );


    if (replyForm) {

        replyForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                if (
                    conversation.status !==
                    "open"
                ) {

                    alert(
                        "This conversation is closed. Reopen it before sending a reply."
                    );

                    return;
                }


                const message =
                    replyInput.value.trim();


                if (!message) {

                    return;
                }


                replyInput.disabled =
                    true;


                replyButton.disabled =
                    true;


                const originalButton =
                    replyButton.innerHTML;


                replyButton.innerHTML =
                    `
                        <i class="fa-solid fa-spinner fa-spin"></i>
                    `;


                try {

                    const {
                        data: {
                            user
                        },
                        error: userError
                    } =
                        await supabaseClient.auth
                            .getUser();


                    if (
                        userError ||
                        !user
                    ) {

                        throw new Error(
                            "Your admin session has expired. Please sign in again."
                        );
                    }


                    const {
                        error
                    } =
                        await supabaseClient
                            .from(
                                "chat_messages"
                            )
                            .insert({

                                conversation_id:
                                    conversation.id,

                                sender_id:
                                    user.id,

                                sender_type:
                                    "admin",

                                message:
                                    message

                            });


                    if (error) {

                        throw error;
                    }


                    replyInput.value =
                        "";


                    await reloadConversationMessages(
                        conversation
                    );


                } catch (error) {

                    console.error(
                        "Admin message error:",
                        error
                    );


                    alert(
                        "Unable to send message: " +
                        error.message
                    );


                } finally {

                    replyInput.disabled =
                        conversation.status !==
                        "open";


                    replyButton.disabled =
                        conversation.status !==
                        "open";


                    replyButton.innerHTML =
                        originalButton;


                    if (
                        conversation.status ===
                        "open"
                    ) {

                        replyInput.focus();

                    }

                }

            }
        );
    }


    /* =====================================================
       SCROLL TO LATEST MESSAGE
       ===================================================== */

    const messagesContainer =
        document.getElementById(
            "adminChatMessages"
        );


    if (messagesContainer) {

        messagesContainer.scrollTop =
            messagesContainer.scrollHeight;
    }
}


/* =========================================================
   UPDATE CONVERSATION STATUS
   ========================================================= */

async function updateConversationStatus(
    conversation
) {

    const statusButton =
        document.getElementById(
            "conversationStatusButton"
        );


    if (!statusButton) {

        return;
    }


    const newStatus =
        conversation.status === "open"
            ? "closed"
            : "open";


    const actionText =
        newStatus === "closed"
            ? "Close"
            : "Reopen";


    const confirmMessage =
        newStatus === "closed"
            ? "Close this conversation?"
            : "Reopen this conversation?";


    const shouldContinue =
        window.confirm(
            confirmMessage
        );


    if (!shouldContinue) {

        return;
    }


    statusButton.disabled =
        true;


    statusButton.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>

        <span>
            ${actionText}ing...
        </span>
    `;


    try {

        const {
            error
        } =
            await supabaseClient
                .from(
                    "chat_conversations"
                )
                .update({
                    status: newStatus
                })
                .eq(
                    "id",
                    conversation.id
                );


        if (error) {

            throw error;
        }


        conversation.status =
            newStatus;


        currentConversation =
            conversation;


        await loadConversations();


        renderConversationStatusOnly(
            conversation
        );


    } catch (error) {

        console.error(
            "Conversation status update error:",
            error
        );


        alert(
            "Unable to update conversation status: " +
            error.message
        );


        statusButton.disabled =
            false;


        renderConversationStatusOnly(
            conversation
        );
    }
}


/* =========================================================
   UPDATE STATUS CONTROLS
   ========================================================= */

function renderConversationStatusOnly(
    conversation
) {

    const statusButton =
        document.getElementById(
            "conversationStatusButton"
        );


    const statusElement =
        document.querySelector(
            ".admin-active-chat-header .conversation-status"
        );


    const replyInput =
        document.getElementById(
            "adminChatReplyInput"
        );


    const replyButton =
        document.getElementById(
            "adminChatReplyButton"
        );


    const isOpen =
        conversation.status === "open";


    if (statusElement) {

        statusElement.className =
            `conversation-status ${
                isOpen
                    ? "is-open"
                    : "is-closed"
            }`;

        statusElement.textContent =
            conversation.status;
    }


    if (statusButton) {

        statusButton.disabled =
            false;

        statusButton.className =
            `admin-conversation-status-button ${
                isOpen
                    ? "is-close-action"
                    : "is-open-action"
            }`;

        statusButton.innerHTML = `
            <i class="fa-solid ${
                isOpen
                    ? "fa-lock"
                    : "fa-lock-open"
            }"></i>

            <span>
                ${
                    isOpen
                        ? "Close"
                        : "Reopen"
                }
            </span>
        `;
    }


    if (replyInput) {

        replyInput.disabled =
            !isOpen;

        replyInput.required =
            isOpen;

        replyInput.placeholder =
            isOpen
                ? "Write a reply..."
                : "Conversation is closed";
    }


    if (replyButton) {

        replyButton.disabled =
            !isOpen;
    }
}


/* =========================================================
   RELOAD MESSAGES
   ========================================================= */

async function reloadConversationMessages(
    conversation
) {

    const {
        data: messages,
        error
    } =
        await supabaseClient
            .from("chat_messages")
            .select(`
                id,
                conversation_id,
                sender_id,
                sender_type,
                message,
                created_at
            `)
            .eq(
                "conversation_id",
                conversation.id
            )
            .order(
                "created_at",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "Message reload error:",
            error
        );

        return;
    }


    const messagesContainer =
        document.getElementById(
            "adminChatMessages"
        );


    if (!messagesContainer) {

        return;
    }


    messagesContainer.innerHTML =
        messages.length

            ? messages
                .map(
                    message =>
                        createAdminMessage(
                            message
                        )
                )
                .join("")

            : `

                <div class="admin-chat-no-messages">

                    <i class="fa-regular fa-message"></i>

                    <strong>
                        No messages yet
                    </strong>

                    <p>
                        This conversation has not received a message yet.
                    </p>

                </div>

            `;


    messagesContainer.scrollTop =
        messagesContainer.scrollHeight;
}


/* =========================================================
   STAGE 9 — NOTIFICATION CONTROLS
   ========================================================= */

function setupNotificationControls() {

    if (
        !adminMessageNotification ||
        !adminMessageNotificationClose
    ) {

        return;
    }


    /*
     * Prevent duplicate click listeners if the function
     * is called again after login.
     */

    if (
        adminMessageNotification.dataset.ready ===
        "true"
    ) {

        return;
    }


    adminMessageNotification.dataset.ready =
        "true";


    adminMessageNotificationClose.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            hideMessageNotification();

        }
    );


    adminMessageNotification.addEventListener(
        "click",
        function (event) {

            if (
                event.target.closest(
                    ".admin-message-notification-close"
                )
            ) {

                return;
            }


            const conversationId =
                Number(
                    adminMessageNotification.dataset
                        .conversationId
                );


            if (!conversationId) {

                return;
            }


            const item =
                document.querySelector(
                    `.conversation-item[data-conversation-id="${conversationId}"]`
                );


            if (item) {

                item.click();

            }


            hideMessageNotification();

        }
    );
}


/* =========================================================
   SHOW MESSAGE NOTIFICATION
   ========================================================= */

function showMessageNotification(
    conversationId,
    visitorName
) {

    if (
        !adminMessageNotification ||
        !adminMessageNotificationText
    ) {

        return;
    }


    if (!visitorName) {

        visitorName =
            "A visitor";
    }


    if (notificationTimeout) {

        clearTimeout(
            notificationTimeout
        );

        notificationTimeout =
            null;
    }


    adminMessageNotification.dataset
        .conversationId =
        String(
            conversationId
        );


    adminMessageNotificationText.textContent =
        `${visitorName} sent you a new message.`;


    adminMessageNotification.classList.add(
        "is-visible"
    );


    adminMessageNotification.setAttribute(
        "aria-hidden",
        "false"
    );


    notificationTimeout =
        setTimeout(
            function () {

                hideMessageNotification();

            },
            5000
        );
}


/* =========================================================
   HIDE MESSAGE NOTIFICATION
   ========================================================= */

function hideMessageNotification() {

    if (!adminMessageNotification) {

        return;
    }


    adminMessageNotification.classList.remove(
        "is-visible"
    );


    adminMessageNotification.setAttribute(
        "aria-hidden",
        "true"
    );


    adminMessageNotification.dataset
        .conversationId =
        "";


    if (notificationTimeout) {

        clearTimeout(
            notificationTimeout
        );

        notificationTimeout =
            null;
    }
}


/* =========================================================
   GET CONVERSATION FOR NOTIFICATION
   ========================================================= */

async function getConversationForNotification(
    conversationId
) {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("chat_conversations")
            .select(`
                id,
                visitor_name,
                visitor_email,
                status
            `)
            .eq(
                "id",
                conversationId
            )
            .maybeSingle();


    if (error) {

        console.error(
            "Notification conversation lookup error:",
            error
        );

        return null;
    }


    return data;
}


/* =========================================================
   REALTIME
   ========================================================= */

function setupRealtime() {

    cleanupRealtime();


    /* -----------------------------------------------------
       CHAT MESSAGES
       ----------------------------------------------------- */

    chatMessagesChannel =
        supabaseClient
            .channel(
                "admin-chat-messages"
            )
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "chat_messages"
                },
                async function (payload) {

                    const newMessage =
                        payload.new;


                    /*
                     * Admin messages should never create
                     * an unread visitor indicator or
                     * notification.
                     */

                    const isVisitorMessage =
                        newMessage.sender_type ===
                        "visitor";


                    /*
                     * If the new message belongs to the
                     * conversation currently open,
                     * reload the messages automatically.
                     */

                    if (
                        currentConversation &&
                        Number(
                            newMessage.conversation_id
                        ) === Number(
                            currentConversation.id
                        )
                    ) {

                        /*
                         * The conversation is currently
                         * being viewed, so it is not unread.
                         */

                        unreadConversationIds.delete(
                            Number(
                                newMessage.conversation_id
                            )
                        );


                        hideMessageNotification();


                        await reloadConversationMessages(
                            currentConversation
                        );

                        await loadConversations();

                        return;
                    }


                    /*
                     * A different conversation received
                     * a visitor message.
                     */

                    if (isVisitorMessage) {

                        const conversationId =
                            Number(
                                newMessage.conversation_id
                            );


                        unreadConversationIds.add(
                            conversationId
                        );


                        /*
                         * Find the visitor's name so the
                         * notification can identify them.
                         */

                        const conversation =
                            await getConversationForNotification(
                                conversationId
                            );


                        if (conversation) {

                            showMessageNotification(
                                conversationId,
                                conversation.visitor_name
                            );

                        }


                    }


                    await loadConversations();

                }
            )
            .subscribe();


    /* -----------------------------------------------------
       CONVERSATIONS
       ----------------------------------------------------- */

    conversationChannel =
        supabaseClient
            .channel(
                "admin-chat-conversations"
            )
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "chat_conversations"
                },
                async function (payload) {

                    const changedConversation =
                        payload.new;


                    /*
                     * A brand-new conversation is created
                     * when a visitor starts a chat.
                     */

                    if (
                        payload.eventType ===
                        "INSERT" &&
                        changedConversation
                    ) {

                        const conversationId =
                            Number(
                                changedConversation.id
                            );


                        unreadConversationIds.add(
                            conversationId
                        );


                        /*
                         * A brand-new conversation also
                         * deserves a notification.
                         */

                        showMessageNotification(
                            conversationId,
                            changedConversation.visitor_name
                        );

                    }


                    /*
                     * Refresh the inbox so new
                     * conversations and changes appear.
                     */

                    await loadConversations();


                    /*
                     * If the conversation currently open
                     * was changed, update its local state.
                     */

                    if (
                        currentConversation &&
                        changedConversation &&
                        Number(
                            changedConversation.id
                        ) === Number(
                            currentConversation.id
                        )
                    ) {

                        currentConversation =
                            {
                                ...currentConversation,
                                ...changedConversation
                            };


                        renderConversationStatusOnly(
                            currentConversation
                        );

                    }

                }
            )
            .subscribe();

}


/* =========================================================
   CLEANUP REALTIME
   ========================================================= */

function cleanupRealtime() {

    if (chatMessagesChannel) {

        supabaseClient.removeChannel(
            chatMessagesChannel
        );

        chatMessagesChannel =
            null;
    }


    if (conversationChannel) {

        supabaseClient.removeChannel(
            conversationChannel
        );

        conversationChannel =
            null;
    }
}


/* =========================================================
   CREATE ADMIN MESSAGE
   ========================================================= */

function createAdminMessage(
    message
) {

    const isVisitor =
        message.sender_type ===
        "visitor";


    const senderLabel =
        isVisitor
            ? "Visitor"
            : "You";


    const messageDate =
        formatMessageDate(
            message.created_at
        );


    return `

        <div
            class="admin-chat-message ${
                isVisitor
                    ? "is-visitor"
                    : "is-admin"
            }"
        >

            <div class="admin-chat-message-meta">

                ${escapeHtml(
                    senderLabel
                )}

                ·

                ${escapeHtml(
                    messageDate
                )}

            </div>


            <div class="admin-chat-message-bubble">

                ${escapeHtml(
                    message.message
                )}

            </div>

        </div>

    `;
}


/* =========================================================
   GET INITIALS
   ========================================================= */

function getInitials(
    name
) {

    const parts =
        name
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (!parts.length) {

        return "?";
    }


    if (parts.length === 1) {

        return parts[0]
            .substring(
                0,
                2
            )
            .toUpperCase();
    }


    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();
}


/* =========================================================
   FORMAT CONVERSATION DATE
   ========================================================= */

function formatConversationDate(
    value
) {

    if (!value) {

        return "";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";
    }


    return date.toLocaleString(
        "en-NG",
        {
            day: "numeric",
            month: "short",
            hour: "numeric",
            minute: "2-digit"
        }
    );
}


/* =========================================================
   FORMAT MESSAGE DATE
   ========================================================= */

function formatMessageDate(
    value
) {

    if (!value) {

        return "";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";
    }


    return date.toLocaleString(
        "en-NG",
        {
            day: "numeric",
            month: "short",
            hour: "numeric",
            minute: "2-digit"
        }
    );
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
}