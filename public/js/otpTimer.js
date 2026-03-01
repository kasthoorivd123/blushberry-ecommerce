console.log(timer)

function startOtpTimer(timerId, buttonId, duration = 60) {

  let timeLeft = duration;

  const timer = document.getElementById(timerId);
  const resendBtn = document.getElementById(buttonId);

  if (!timer || !resendBtn) return;

  resendBtn.disabled = true;

  const interval = setInterval(() => {

    timer.innerText = `Resend OTP in ${timeLeft}s`;
    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(interval);
      timer.innerText = "";
      resendBtn.disabled = false;
    }

  }, 1000);
}