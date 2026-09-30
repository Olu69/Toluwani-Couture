/* =========================================================
   TOLUWANI COUTURE — APPOINTMENT + CHAT
   ========================================================= */

/* =========================================================
   SUPABASE
   ========================================================= */

const SUPABASE_URL =
    "https://istbncxutptjguijzfqq.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_uZOo6VslQBSy5pn-RoK_pA_K6URSPSZ";

let supabaseClient = null;

if (SUPABASE_KEY) {

    supabaseClient = supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

}

/* =========================================================
   APPOINTMENT FORM
   ========================================================= */

const appointmentForm =
    document.getElementById("appointmentForm");

if (appointmentForm) {

    appointmentForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            if (!supabaseClient) {

                alert(
                    "Supabase key is not configured yet."
                );

                return;

            }

            const submitButton =
                appointmentForm.querySelector(
                    ".appointment-submit"
                );

            const fullName =
                document
                    .getElementById("fullName")
                    .value
                    .trim();

            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();

            const phone =
                document
                    .getElementById("phone")
                    .value
                    .trim();

            const appointmentType =
                document
                    .getElementById("appointmentType")
                    .value;

            const preferredDate =
                document
                    .getElementById("preferredDate")
                    .value;

            const preferredTime =
                document
                    .getElementById("preferredTime")
                    .value;

            const message =
                document
                    .getElementById("message")
                    .value
                    .trim();

            if (
                !fullName ||
                !email ||
                !phone ||
                !appointmentType ||
                !preferredDate ||
                !preferredTime
            ) {

                alert(
                    "Please complete all required fields."
                );

                return;

            }

            const originalButtonText =
                submitButton.innerHTML;

            submitButton.disabled = true;

            submitButton.innerHTML = `
                Sending Request...
            `;

            try {

                const { error } =
                    await supabaseClient
                        .from("appointments")
                        .insert([
                            {
                                full_name:
                                    fullName,

                                email:
                                    email,

                                phone:
                                    phone,

                                appointment_type:
                                    appointmentType,

                                preferred_date:
                                    preferredDate,

                                preferred_time:
                                    preferredTime,

                                message:
                                    message
                            }
                        ]);

                if (error) {
                    throw error;
                }

                appointmentForm.reset();

                submitButton.innerHTML = `
                    Request Sent
                    <i class="fa-solid fa-check"></i>
                `;

                const confirmation =
                    document.createElement("div");

                confirmation.className =
                    "appointment-success-message";

                confirmation.innerHTML = `
                    <strong>
                        Appointment request received.
                    </strong>

                    <p>
                        Thank you for reaching out to
                        Toluwani Couture. We've received
                        your request and will review
                        the details. You'll receive a
                        response by email once your
                        appointment has been reviewed.
                    </p>
                `;

                appointmentForm.insertAdjacentElement(
                    "afterend",
                    confirmation
                );

                setTimeout(() => {

                    confirmation.remove();

                    submitButton.disabled = false;

                    submitButton.innerHTML =
                        originalButtonText;

                }, 1500);

            } catch (error) {

                console.error(
                    "Appointment submission error:",
                    error
                );

                alert(
                    "Appointment error:\n\n" +
                    (
                        error.message ||
                        "Unknown error"
                    )
                );

                submitButton.disabled = false;

                submitButton.innerHTML =
                    originalButtonText;

            }

        }
    );

}

/* =========================================================
   CHAT ELEMENTS
   ========================================================= */

const startConversationBtn =
    document.getElementById(
        "startConversationBtn"
    );

const chatStartOverlay =
    document.getElementById(
        "chatStartOverlay"
    );

const chatCloseBtn =
    document.getElementById(
        "chatCloseBtn"
    );

const chatStartForm =
    document.getElementById(
        "chatStartForm"
    );

const chatVisitorName =
    document.getElementById(
        "chatVisitorName"
    );

const chatVisitorEmail =
    document.getElementById(
        "chatVisitorEmail"
    );

const chatStartSubmit =
    document.getElementById(
        "chatStartSubmit"
    );

const chatStartError =
    document.getElementById(
        "chatStartError"
    );

/* =========================================================
   CHAT STATE
   ========================================================= */

let currentChatUser = null;

let currentConversation = null;

let chatRealtimeChannel = null;

/* =========================================================
   OPEN CHAT START WINDOW
   ========================================================= */

if (
    startConversationBtn &&
    chatStartOverlay
) {

    startConversationBtn.addEventListener(
        "click",
        function () {

            chatStartOverlay.classList.add(
                "is-open"
            );

            chatStartOverlay.setAttribute(
                "aria-hidden",
                "false"
            );

            if (chatStartError) {

                chatStartError.textContent =
                    "";

            }

            setTimeout(() => {

                if (chatVisitorName) {

                    chatVisitorName.focus();

                }

            }, 100);

        }
    );

}

/* =========================================================
   CLOSE CHAT START WINDOW
   ========================================================= */

function closeChatStartWindow() {

    if (!chatStartOverlay) {
        return;
    }

    chatStartOverlay.classList.remove(
        "is-open"
    );

    chatStartOverlay.setAttribute(
        "aria-hidden",
        "true"
    );

    if (chatStartError) {

        chatStartError.textContent =
            "";

    }

}

if (chatCloseBtn) {

    chatCloseBtn.addEventListener(
        "click",
        closeChatStartWindow
    );

}

/* =========================================================
   CLOSE BY CLICKING OUTSIDE WINDOW
   ========================================================= */

if (chatStartOverlay) {

    chatStartOverlay.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                chatStartOverlay
            ) {

                closeChatStartWindow();

            }

        }
    );

}

/* =========================================================
   ESCAPE KEY
   ========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            chatStartOverlay &&
            chatStartOverlay.classList.contains(
                "is-open"
            )
        ) {

            closeChatStartWindow();

        }

    }
);

/* =========================================================
   CHAT ERROR
   ========================================================= */

function showChatStartError(
    message
) {

    if (!chatStartError) {
        return;
    }

    chatStartError.textContent =
        message;

}

/* =========================================================
   GET CHAT USER
   ========================================================= */

async function getChatUser() {

    if (!supabaseClient) {

        throw new Error(
            "Supabase key is not configured yet."
        );

    }

    const {
        data: {
            user
        },
        error: sessionError
    } =
        await supabaseClient.auth.getUser();

    /* =====================================================
       CHECK FOR EXISTING USER
       ===================================================== */

    if (
        !sessionError &&
        user
    ) {

        return user;

    }

    /* =====================================================
       ANONYMOUS SIGN-IN
       ===================================================== */

    const {
        data,
        error
    } =
        await supabaseClient.auth
            .signInAnonymously();

    if (error) {
        throw error;
    }

    if (!data.user) {

        throw new Error(
            "Unable to create chat session."
        );

    }

    return data.user;

}

/* =========================================================
   CREATE CHAT CONVERSATION
   ========================================================= */

async function createChatConversation(
    visitorName,
    visitorEmail
) {

    if (!supabaseClient) {

        throw new Error(
            "Supabase key is not configured yet."
        );

    }

    const user =
        await getChatUser();

    currentChatUser =
        user;

    const {
        data,
        error
    } =
        await supabaseClient
            .from("chat_conversations")
            .insert([
                {
                    visitor_id:
                        user.id,

                    visitor_name:
                        visitorName,

                    visitor_email:
                        visitorEmail,

                    status:
                        "open"
                }
            ])
            .select()
            .single();

    if (error) {
        throw error;
    }

    if (!data) {

        throw new Error(
            "Unable to create conversation."
        );

    }

    currentConversation =
        data;

    return data;

}

/* =========================================================
   START CHAT FORM
   ========================================================= */

if (chatStartForm) {

    chatStartForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const visitorName =
                chatVisitorName
                    ? chatVisitorName
                        .value
                        .trim()
                    : "";

            const visitorEmail =
                chatVisitorEmail
                    ? chatVisitorEmail
                        .value
                        .trim()
                    : "";

            showChatStartError("");

            if (
                !visitorName ||
                !visitorEmail
            ) {

                showChatStartError(
                    "Please enter your name and email."
                );

                return;

            }

            if (!supabaseClient) {

                showChatStartError(
                    "Supabase key is not configured yet."
                );

                return;

            }

            const originalButtonText =
                chatStartSubmit.innerHTML;

            chatStartSubmit.disabled =
                true;

            chatStartSubmit.innerHTML = `
                Starting Chat...
            `;

            try {

                const conversation =
                    await createChatConversation(
                        visitorName,
                        visitorEmail
                    );

                closeChatStartWindow();

                createChatWindow(
                    conversation
                );

            } catch (error) {

                console.error(
                    "Chat start error:",
                    error
                );

                showChatStartError(
                    error.message ||
                    "Unable to start the chat. Please try again."
                );

            } finally {

                chatStartSubmit.disabled =
                    false;

                chatStartSubmit.innerHTML =
                    originalButtonText;

            }

        }
    );

}

/* =========================================================
   CREATE ACTUAL CHAT WINDOW
   ========================================================= */

function createChatWindow(
    conversation
) {

    const existingChat =
        document.getElementById(
            "toluwaniChatWindow"
        );

    if (existingChat) {

        existingChat.remove();

    }

    const chatWindow =
        document.createElement("div");

    chatWindow.id =
        "toluwaniChatWindow";

    chatWindow.className =
        "toluwani-chat-window";

    chatWindow.innerHTML = `

        <div class="toluwani-chat-header">

            <div class="toluwani-chat-brand">

                <img
                    src="logo.png"
                    alt="Toluwani Couture"
                >

                <div>

                    <strong>
                        Toluwani Couture
                    </strong>

                    <span>
                        We're here to help
                    </span>

                </div>

            </div>

            <button
                type="button"
                class="toluwani-chat-close"
                id="toluwaniChatClose"
                aria-label="Close chat"
            >

                <i class="fa-solid fa-xmark"></i>

            </button>

        </div>

        <div
            class="toluwani-chat-messages"
            id="toluwaniChatMessages"
        >

            <div class="toluwani-chat-empty">

                <span>
                    Start the conversation.
                </span>

                <p>
                    Send us a message and we'll
                    get back to you here.
                </p>

            </div>

        </div>

        <form
            class="toluwani-chat-form"
            id="toluwaniChatForm"
        >

            <input
                type="text"
                id="toluwaniChatInput"
                placeholder="Write a message..."
                autocomplete="off"
                maxlength="1000"
                required
            >

            <button
                type="submit"
                id="toluwaniChatSend"
                aria-label="Send message"
            >

                <i class="fa-solid fa-arrow-up"></i>

            </button>

        </form>

    `;

    document.body.appendChild(
        chatWindow
    );

    requestAnimationFrame(() => {

        chatWindow.classList.add(
            "is-open"
        );

    });

    setupChatWindow(
        conversation
    );

}

/* =========================================================
   CHAT WINDOW SETUP
   ========================================================= */

async function setupChatWindow(
    conversation
) {

    const closeButton =
        document.getElementById(
            "toluwaniChatClose"
        );

    const chatForm =
        document.getElementById(
            "toluwaniChatForm"
        );

    const chatInput =
        document.getElementById(
            "toluwaniChatInput"
        );

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeActualChat
        );

    }

    if (chatForm) {

        chatForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                await sendChatMessage();

            }
        );

    }

    /*
     * Connect to Realtime FIRST.
     *
     * We wait until the visitor's subscription
     * is actually ready before loading messages.
     *
     * This prevents a small timing gap where an
     * admin message could be inserted before the
     * visitor's Realtime listener was ready.
     */

    await subscribeToChatMessages(
        conversation.id
    );

    /*
     * Realtime is now ready.
     *
     * Load the latest messages after the
     * subscription is active.
     */

    await loadChatMessages(
        conversation.id
    );

    setTimeout(() => {

        if (chatInput) {

            chatInput.focus();

        }

    }, 200);

}

/* =========================================================
   CLOSE ACTUAL CHAT
   ========================================================= */

function closeActualChat() {

    const chatWindow =
        document.getElementById(
            "toluwaniChatWindow"
        );

    if (!chatWindow) {
        return;
    }

    chatWindow.classList.remove(
        "is-open"
    );

    setTimeout(() => {

        chatWindow.remove();

    }, 200);

    if (
        chatRealtimeChannel &&
        supabaseClient
    ) {

        supabaseClient.removeChannel(
            chatRealtimeChannel
        );

        chatRealtimeChannel =
            null;

    }

}

/* =========================================================
   LOAD CHAT MESSAGES
   ========================================================= */

async function loadChatMessages(
    conversationId
) {

    if (!supabaseClient) {
        return;
    }

    const {
        data,
        error
    } =
        await supabaseClient
            .from("chat_messages")
            .select("*")
            .eq(
                "conversation_id",
                conversationId
            )
            .order(
                "created_at",
                {
                    ascending: true
                }
            );

    if (error) {

        console.error(
            "Unable to load chat messages:",
            error
        );

        return;

    }

    const messages =
        document.getElementById(
            "toluwaniChatMessages"
        );

    if (!messages) {
        return;
    }

    messages.innerHTML =
        "";

    if (
        !data ||
        data.length === 0
    ) {

        messages.innerHTML = `

            <div class="toluwani-chat-empty">

                <span>
                    Start the conversation.
                </span>

                <p>
                    Send us a message and we'll
                    get back to you here.
                </p>

            </div>

        `;

        return;

    }

    data.forEach(
        function (message) {

            addChatMessageToWindow(
                message
            );

        }
    );

    scrollChatToBottom();

}

/* =========================================================
   ADD MESSAGE TO CHAT
   ========================================================= */

function addChatMessageToWindow(
    message
) {

    const messages =
        document.getElementById(
            "toluwaniChatMessages"
        );

    if (!messages) {
        return;
    }

    /*
     * Prevent the same message from being
     * displayed twice if Realtime and a reload
     * happen very close together.
     */

    if (
        message.id &&
        messages.querySelector(
            `[data-message-id="${message.id}"]`
        )
    ) {

        return;

    }

    const emptyState =
        messages.querySelector(
            ".toluwani-chat-empty"
        );

    if (emptyState) {

        emptyState.remove();

    }

    const messageElement =
        document.createElement("div");

    messageElement.className =
        "toluwani-chat-message " +
        (
            message.sender_type === "admin"
                ? "is-admin"
                : "is-visitor"
        );

    if (message.id) {

        messageElement.dataset.messageId =
            message.id;

    }

    messageElement.innerHTML = `

        <div class="toluwani-chat-bubble">

            ${escapeChatMessage(
                message.message
            )}

        </div>

    `;

    messages.appendChild(
        messageElement
    );

    scrollChatToBottom();

}

/* =========================================================
   SEND CHAT MESSAGE
   ========================================================= */

async function sendChatMessage() {

    if (
        !supabaseClient ||
        !currentConversation ||
        !currentChatUser
    ) {

        return;

    }

    const input =
        document.getElementById(
            "toluwaniChatInput"
        );

    const sendButton =
        document.getElementById(
            "toluwaniChatSend"
        );

    if (!input) {
        return;
    }

    const message =
        input.value.trim();

    if (!message) {
        return;
    }

    input.disabled =
        true;

    if (sendButton) {

        sendButton.disabled =
            true;

    }

    try {

        const {
            error
        } =
            await supabaseClient
                .from("chat_messages")
                .insert([
                    {
                        conversation_id:
                            currentConversation.id,

                        sender_id:
                            currentChatUser.id,

                        sender_type:
                            "visitor",

                        message:
                            message
                    }
                ]);

        if (error) {
            throw error;
        }

        input.value =
            "";

    } catch (error) {

        console.error(
            "Chat message error:",
            error
        );

        alert(
            "Unable to send message. Please try again."
        );

    } finally {

        input.disabled =
            false;

        if (sendButton) {

            sendButton.disabled =
                false;

        }

        input.focus();

    }

}

/* =========================================================
   REALTIME CHAT
   ========================================================= */

function subscribeToChatMessages(
    conversationId
) {

    return new Promise(
        function (resolve, reject) {

            if (!supabaseClient) {

                resolve();

                return;

            }

            /*
             * Remove any previous listener first.
             */

            if (chatRealtimeChannel) {

                supabaseClient.removeChannel(
                    chatRealtimeChannel
                );

                chatRealtimeChannel =
                    null;

            }

            /*
             * Create a Realtime listener for THIS
             * conversation only.
             */

            chatRealtimeChannel =
                supabaseClient
                    .channel(
                        "visitor-chat-" +
                        conversationId
                    )
                    .on(
                        "postgres_changes",
                        {
                            event: "INSERT",
                            schema: "public",
                            table: "chat_messages",
                            filter:
                                "conversation_id=eq." +
                                conversationId
                        },
                        function (payload) {

                            const newMessage =
                                payload.new;

                            /*
                             * Add the incoming message
                             * directly to the visitor chat.
                             *
                             * This includes admin messages.
                             */

                            addChatMessageToWindow(
                                newMessage
                            );

                        }
                    )
                    .subscribe(
                        function (status) {

                            console.log(
                                "Visitor chat Realtime status:",
                                status
                            );

                            if (
                                status ===
                                "SUBSCRIBED"
                            ) {

                                resolve();

                            }

                            if (
                                status ===
                                "CHANNEL_ERROR" ||
                                status ===
                                "TIMED_OUT"
                            ) {

                                reject(
                                    new Error(
                                        "Unable to connect to chat Realtime."
                                    )
                                );

                            }

                        }
                    );

        }
    );

}

/* =========================================================
   ESCAPE CHAT MESSAGE
   ========================================================= */

function escapeChatMessage(
    message
) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        message;

    return div.innerHTML;

}

/* =========================================================
   SCROLL CHAT TO BOTTOM
   ========================================================= */

function scrollChatToBottom() {

    const messages =
        document.getElementById(
            "toluwaniChatMessages"
        );

    if (!messages) {
        return;
    }

    messages.scrollTop =
        messages.scrollHeight;

}