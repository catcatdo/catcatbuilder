const ALL_TESTS = [
    // ============================================================
    // TEST 1: 포켓몬 성격 테스트
    // ============================================================
    {
        id: 'pokemon',
        title: '나는 어떤 포켓몬일까?',
        subtitle: '12가지 질문으로 알아보는 나의 포켓몬',
        emoji: '⚡',
        color: '#ff6b6b',
        questionCount: 12,
        resultCount: 10,
        questions: [
            {
                id: 1,
                text: '친구들과 모였을 때 나는 주로 어떤 역할인가요?',
                options: [
                    {
                        text: '분위기를 띄우는 에너자이저! 모두를 웃게 만든다',
                        scores: { pikachu: 3, jigglypuff: 2, eevee: 1 }
                    },
                    {
                        text: '조용히 관찰하다가 핵심을 짚는 참모 역할',
                        scores: { mewtwo: 3, lucario: 2, gengar: 1 }
                    },
                    {
                        text: '모두를 챙기는 따뜻한 리더',
                        scores: { bulbasaur: 3, squirtle: 2, charmander: 1 }
                    },
                    {
                        text: '자유롭게 돌아다니며 각자와 대화하는 사교왕',
                        scores: { eevee: 3, pikachu: 2, jigglypuff: 1 }
                    }
                ]
            },
            {
                id: 2,
                text: '스트레스를 받을 때 나만의 해소법은?',
                options: [
                    {
                        text: '맛있는 음식을 잔뜩 먹고 푹 잔다',
                        scores: { snorlax: 3, squirtle: 2, bulbasaur: 1 }
                    },
                    {
                        text: '혼자만의 시간에 깊이 생각하며 정리한다',
                        scores: { mewtwo: 3, gengar: 2, lucario: 1 }
                    },
                    {
                        text: '운동이나 활동적인 걸 하면서 에너지를 쏟는다',
                        scores: { charmander: 3, lucario: 2, pikachu: 1 }
                    },
                    {
                        text: '친한 친구에게 전화해서 수다를 떤다',
                        scores: { jigglypuff: 3, eevee: 2, pikachu: 1 }
                    }
                ]
            },
            {
                id: 3,
                text: '여행을 간다면 어떤 스타일인가요?',
                options: [
                    {
                        text: '철저하게 계획을 세워서 알찬 일정을 소화한다',
                        scores: { lucario: 3, mewtwo: 2, bulbasaur: 1 }
                    },
                    {
                        text: '대충 방향만 잡고 즉흥적으로 움직인다',
                        scores: { pikachu: 3, charmander: 2, eevee: 1 }
                    },
                    {
                        text: '숙소에서 편하게 쉬는 게 최고! 힐링 여행파',
                        scores: { snorlax: 3, squirtle: 2, jigglypuff: 1 }
                    },
                    {
                        text: '현지인만 아는 숨은 명소를 찾아다닌다',
                        scores: { gengar: 3, eevee: 2, charmander: 1 }
                    }
                ]
            },
            {
                id: 4,
                text: '중요한 결정을 내릴 때 나는?',
                options: [
                    {
                        text: '직감을 믿고 빠르게 결정한다',
                        scores: { charmander: 3, pikachu: 2, eevee: 1 }
                    },
                    {
                        text: '모든 가능성을 분석한 후 논리적으로 판단한다',
                        scores: { mewtwo: 3, lucario: 2, gengar: 1 }
                    },
                    {
                        text: '주변 사람들의 의견을 충분히 듣고 결정한다',
                        scores: { bulbasaur: 3, jigglypuff: 2, squirtle: 1 }
                    },
                    {
                        text: '일단 미루고 본다... 어떻게든 되겠지',
                        scores: { snorlax: 3, squirtle: 2, eevee: 1 }
                    }
                ]
            },
            {
                id: 5,
                text: '주말 아침, 일어나자마자 하고 싶은 것은?',
                options: [
                    {
                        text: '이불 속에서 뒹굴뒹굴하며 늦잠 자기',
                        scores: { snorlax: 3, jigglypuff: 2, squirtle: 1 }
                    },
                    {
                        text: '일찍 일어나서 조깅이나 운동하기',
                        scores: { lucario: 3, charmander: 2, pikachu: 1 }
                    },
                    {
                        text: '밀린 드라마나 유튜브 정주행하기',
                        scores: { gengar: 3, eevee: 2, snorlax: 1 }
                    },
                    {
                        text: '친구들에게 연락해서 약속 잡기',
                        scores: { pikachu: 3, jigglypuff: 2, eevee: 1 }
                    }
                ]
            },
            {
                id: 6,
                text: '갑자기 길에서 길 잃은 강아지를 발견했다면?',
                options: [
                    {
                        text: '당장 데려가서 보호소에 연락한다',
                        scores: { bulbasaur: 3, squirtle: 2, lucario: 1 }
                    },
                    {
                        text: '사진 찍어서 SNS에 올려 주인을 찾아준다',
                        scores: { pikachu: 3, eevee: 2, jigglypuff: 1 }
                    },
                    {
                        text: '안타깝지만 전문가에게 맡기는 게 낫다고 생각한다',
                        scores: { mewtwo: 3, gengar: 2, charmander: 1 }
                    },
                    {
                        text: '일단 간식을 사서 먹이면서 상황을 지켜본다',
                        scores: { snorlax: 3, bulbasaur: 2, squirtle: 1 }
                    }
                ]
            },
            {
                id: 7,
                text: '나를 가장 잘 표현하는 단어는?',
                options: [
                    {
                        text: '열정적이고 에너지 넘치는',
                        scores: { charmander: 3, pikachu: 2, lucario: 1 }
                    },
                    {
                        text: '차분하고 신뢰할 수 있는',
                        scores: { bulbasaur: 3, squirtle: 2, lucario: 1 }
                    },
                    {
                        text: '독특하고 미스터리한',
                        scores: { gengar: 3, mewtwo: 2, eevee: 1 }
                    },
                    {
                        text: '귀엽고 사람들에게 인기 많은',
                        scores: { jigglypuff: 3, eevee: 2, pikachu: 1 }
                    }
                ]
            },
            {
                id: 8,
                text: '팀 프로젝트에서 맡고 싶은 파트는?',
                options: [
                    {
                        text: '발표와 프레젠테이션 담당',
                        scores: { pikachu: 3, jigglypuff: 2, charmander: 1 }
                    },
                    {
                        text: '자료 조사와 분석 담당',
                        scores: { mewtwo: 3, lucario: 2, gengar: 1 }
                    },
                    {
                        text: '팀원 간 소통과 일정 관리 담당',
                        scores: { bulbasaur: 3, squirtle: 2, eevee: 1 }
                    },
                    {
                        text: '디자인이나 창의적인 작업 담당',
                        scores: { eevee: 3, jigglypuff: 2, gengar: 1 }
                    }
                ]
            },
            {
                id: 9,
                text: '화가 날 때 나의 반응은?',
                options: [
                    {
                        text: '바로 표현한다! 참으면 병이 된다',
                        scores: { charmander: 3, pikachu: 2, lucario: 1 }
                    },
                    {
                        text: '속으로 삭이면서 냉정하게 대처한다',
                        scores: { mewtwo: 3, gengar: 2, squirtle: 1 }
                    },
                    {
                        text: '일단 자리를 피하고 혼자 진정한다',
                        scores: { snorlax: 3, bulbasaur: 2, eevee: 1 }
                    },
                    {
                        text: '신뢰하는 사람에게 속마음을 털어놓는다',
                        scores: { jigglypuff: 3, eevee: 2, bulbasaur: 1 }
                    }
                ]
            },
            {
                id: 10,
                text: '이상적인 미래의 나의 모습은?',
                options: [
                    {
                        text: '많은 사람에게 영향력을 가진 리더',
                        scores: { pikachu: 3, charmander: 2, lucario: 1 }
                    },
                    {
                        text: '자기 분야에서 최고의 전문가',
                        scores: { mewtwo: 3, lucario: 2, gengar: 1 }
                    },
                    {
                        text: '소중한 사람들과 평화롭게 사는 삶',
                        scores: { bulbasaur: 3, snorlax: 2, squirtle: 1 }
                    },
                    {
                        text: '다양한 경험으로 가득한 자유로운 삶',
                        scores: { eevee: 3, pikachu: 2, charmander: 1 }
                    }
                ]
            },
            {
                id: 11,
                text: '좋아하는 날씨와 가장 어울리는 활동은?',
                options: [
                    {
                        text: '화창한 날 야외에서 바비큐 파티',
                        scores: { pikachu: 3, charmander: 2, jigglypuff: 1 }
                    },
                    {
                        text: '비 오는 날 카페에서 책 읽기',
                        scores: { squirtle: 3, mewtwo: 2, gengar: 1 }
                    },
                    {
                        text: '선선한 가을 날 산책하며 자연 즐기기',
                        scores: { bulbasaur: 3, eevee: 2, lucario: 1 }
                    },
                    {
                        text: '눈 오는 날 이불 속에서 따뜻하게 쉬기',
                        scores: { snorlax: 3, jigglypuff: 2, squirtle: 1 }
                    }
                ]
            },
            {
                id: 12,
                text: '새로운 사람을 만났을 때 나는?',
                options: [
                    {
                        text: '먼저 다가가서 밝게 인사한다',
                        scores: { pikachu: 3, jigglypuff: 2, eevee: 1 }
                    },
                    {
                        text: '상대가 먼저 말 걸기를 기다린다',
                        scores: { gengar: 3, mewtwo: 2, snorlax: 1 }
                    },
                    {
                        text: '공통 관심사를 찾아서 자연스럽게 대화한다',
                        scores: { eevee: 3, bulbasaur: 2, lucario: 1 }
                    },
                    {
                        text: '상황에 따라 다르다, 그때그때 다름',
                        scores: { squirtle: 3, charmander: 2, snorlax: 1 }
                    }
                ]
            }
        ],
        results: {
            pikachu: {
                emoji: '⚡',
                name: '피카츄',
                title: '에너지 넘치는 무드메이커',
                desc: '당신은 어디서든 분위기를 밝히는 에너지 넘치는 사람입니다. 긍정적인 에너지로 주변 사람들에게 활력을 주며, 함께 있으면 자연스럽게 웃음이 나옵니다. 때로는 충동적이지만 그 순수한 열정이 매력 포인트입니다.',
                traits: ['밝고 긍정적인 에너지', '뛰어난 사교성과 리더십', '순수하고 직진하는 성격']
            },
            bulbasaur: {
                emoji: '🌿',
                name: '이상해씨',
                title: '든든한 자연주의 힐러',
                desc: '당신은 따뜻한 마음으로 주변 사람들을 돌보는 든든한 존재입니다. 조용하지만 강한 책임감을 가지고 있으며, 어려운 상황에서도 묵묵히 자기 자리를 지킵니다. 자연과 평화를 사랑하는 당신 곁에 있으면 마음이 편안해집니다.',
                traits: ['따뜻한 배려심과 책임감', '흔들리지 않는 안정감', '자연을 사랑하는 평화주의자']
            },
            charmander: {
                emoji: '🔥',
                name: '파이리',
                title: '불꽃 같은 열정의 도전자',
                desc: '당신은 뜨거운 열정과 강한 의지를 가진 도전적인 사람입니다. 목표가 생기면 끝까지 해내는 추진력이 있으며, 경쟁을 즐기는 승부사 기질이 있습니다. 가끔 성급할 수 있지만 그만큼 강력한 실행력의 소유자입니다.',
                traits: ['뜨거운 열정과 도전 정신', '강한 의지와 추진력', '솔직하고 직선적인 성격']
            },
            squirtle: {
                emoji: '💧',
                name: '꼬부기',
                title: '유연하고 지혜로운 중재자',
                desc: '당신은 상황에 따라 유연하게 대처하는 지혜로운 사람입니다. 감정 조절 능력이 뛰어나며 갈등 상황에서 중재 역할을 잘합니다. 겉으로는 느긋해 보이지만 속으로는 꼼꼼하게 상황을 파악하고 있습니다.',
                traits: ['뛰어난 적응력과 유연함', '감정 조절과 중재 능력', '겉은 쿨하지만 속은 따뜻한']
            },
            eevee: {
                emoji: '✨',
                name: '이브이',
                title: '무한한 가능성의 소유자',
                desc: '당신은 다양한 매력을 가진 변화무쌍한 사람입니다. 어떤 환경에서든 잘 적응하며 새로운 것에 대한 호기심이 가득합니다. 아직 정해지지 않은 무한한 가능성이야말로 당신의 가장 큰 강점입니다.',
                traits: ['다재다능한 적응력', '왕성한 호기심과 탐구심', '끊임없이 성장하는 잠재력']
            },
            snorlax: {
                emoji: '😴',
                name: '잠만보',
                title: '여유로운 힐링의 아이콘',
                desc: '당신은 세상 누구보다 여유롭고 편안한 사람입니다. 급할 것 없는 자신만의 페이스를 유지하며, 먹고 쉬는 것에서 진정한 행복을 찾습니다. 느려 보이지만 한번 마음먹으면 엄청난 저력을 보여주는 반전 매력의 소유자입니다.',
                traits: ['흔들리지 않는 마이페이스', '먹고 쉬는 것을 사랑하는 미식가', '위기 때 빛나는 숨겨진 저력']
            },
            mewtwo: {
                emoji: '🔮',
                name: '뮤츠',
                title: '고독한 천재 전략가',
                desc: '당신은 뛰어난 지적 능력과 깊은 사고력을 가진 사람입니다. 혼자만의 시간을 소중히 여기며 독립적으로 사고하는 것을 좋아합니다. 겉으로는 차가워 보이지만 내면에는 깊은 감성과 철학이 숨어있는 복잡한 매력의 소유자입니다.',
                traits: ['뛰어난 분석력과 통찰력', '독립적이고 자주적인 성향', '깊은 내면의 감수성']
            },
            jigglypuff: {
                emoji: '🎤',
                name: '푸린',
                title: '사랑스러운 관심 집중러',
                desc: '당신은 귀엽고 사랑스러운 매력으로 모든 사람의 시선을 사로잡는 인기쟁이입니다. 자신을 표현하는 것을 좋아하며 예술적 감성이 풍부합니다. 관심받는 것을 좋아하지만 그만큼 다른 사람에게도 따뜻한 애정을 줍니다.',
                traits: ['뛰어난 자기 표현력', '예술적 감성과 창의력', '사람들을 끌어당기는 매력']
            },
            lucario: {
                emoji: '💎',
                name: '루카리오',
                title: '정의로운 완벽주의 전사',
                desc: '당신은 강한 정의감과 철저한 자기 관리 능력을 가진 사람입니다. 목표를 향해 꾸준히 노력하며 자신과의 약속을 반드시 지킵니다. 신뢰할 수 있는 파트너이자 어떤 상황에서도 흔들리지 않는 강인한 멘탈의 소유자입니다.',
                traits: ['강한 정의감과 책임감', '꾸준한 자기 관리와 노력', '흔들리지 않는 강인한 멘탈']
            },
            gengar: {
                emoji: '👻',
                name: '팬텀',
                title: '반전 매력의 장난꾸러기',
                desc: '당신은 독특한 유머 감각과 미스터리한 분위기를 가진 사람입니다. 겉으로는 장난기 가득해 보이지만 실제로는 매우 영리하고 관찰력이 뛰어납니다. 자신만의 세계가 확고하며 가까운 사람에게는 한없이 다정한 반전 매력의 소유자입니다.',
                traits: ['독특한 유머와 위트', '예리한 관찰력과 직감', '가까운 사람에게 보이는 다정함']
            }
        }
    },

    // ============================================================
    // TEST 2: 귀멸의 칼날 성격 테스트
    // ============================================================
    {
        id: 'demon-slayer',
        title: '나는 귀멸의 칼날 누구일까?',
        subtitle: '12가지 질문으로 알아보는 나의 귀멸 캐릭터',
        emoji: '⚔️',
        color: '#e74c3c',
        questionCount: 12,
        resultCount: 10,
        questions: [
            {
                id: 1,
                text: '소중한 사람이 위험에 처했을 때 나의 반응은?',
                options: [
                    {
                        text: '무슨 일이 있어도 반드시 지킨다! 몸을 던진다',
                        scores: { tanjiro: 3, rengoku: 2, mitsuri: 1 }
                    },
                    {
                        text: '두렵지만 용기를 내서 행동한다',
                        scores: { zenitsu: 3, nezuko: 2, muichiro: 1 }
                    },
                    {
                        text: '냉정하게 상황을 판단하고 최선의 방법을 찾는다',
                        scores: { giyu: 3, shinobu: 2, muichiro: 1 }
                    },
                    {
                        text: '일단 돌진한다! 생각은 나중에!',
                        scores: { inosuke: 3, tengen: 2, rengoku: 1 }
                    }
                ]
            },
            {
                id: 2,
                text: '학교나 직장에서 나의 이미지는?',
                options: [
                    {
                        text: '성실하고 착한 모범생 타입',
                        scores: { tanjiro: 3, mitsuri: 2, nezuko: 1 }
                    },
                    {
                        text: '조용하고 미스터리한 분위기',
                        scores: { giyu: 3, muichiro: 2, shinobu: 1 }
                    },
                    {
                        text: '화려하고 존재감이 강한 타입',
                        scores: { tengen: 3, rengoku: 2, inosuke: 1 }
                    },
                    {
                        text: '겉으로는 웃지만 속마음을 잘 안 보여주는 타입',
                        scores: { shinobu: 3, nezuko: 2, zenitsu: 1 }
                    }
                ]
            },
            {
                id: 3,
                text: '힘든 훈련이나 과제가 주어졌을 때?',
                options: [
                    {
                        text: '울면서라도 끝까지 해낸다',
                        scores: { zenitsu: 3, tanjiro: 2, nezuko: 1 }
                    },
                    {
                        text: '이건 식은 죽 먹기! 자신감 넘치게 도전한다',
                        scores: { inosuke: 3, tengen: 2, rengoku: 1 }
                    },
                    {
                        text: '묵묵히 자기 페이스대로 해낸다',
                        scores: { giyu: 3, muichiro: 2, shinobu: 1 }
                    },
                    {
                        text: '동료들과 함께 서로 응원하며 극복한다',
                        scores: { mitsuri: 3, tanjiro: 2, rengoku: 1 }
                    }
                ]
            },
            {
                id: 4,
                text: '가장 중요하게 생각하는 가치는?',
                options: [
                    {
                        text: '가족과 사랑하는 사람들',
                        scores: { tanjiro: 3, nezuko: 2, mitsuri: 1 }
                    },
                    {
                        text: '자기 자신의 강함과 성장',
                        scores: { inosuke: 3, muichiro: 2, giyu: 1 }
                    },
                    {
                        text: '정의와 책임감',
                        scores: { rengoku: 3, giyu: 2, shinobu: 1 }
                    },
                    {
                        text: '화려하게 빛나는 인생',
                        scores: { tengen: 3, mitsuri: 2, zenitsu: 1 }
                    }
                ]
            },
            {
                id: 5,
                text: '무서운 영화를 볼 때 나는?',
                options: [
                    {
                        text: '무서워서 눈을 가리고 비명을 지른다',
                        scores: { zenitsu: 3, mitsuri: 2, nezuko: 1 }
                    },
                    {
                        text: '오히려 흥미진진! 더 무서운 장면을 기대한다',
                        scores: { inosuke: 3, tengen: 2, rengoku: 1 }
                    },
                    {
                        text: '표정 변화 없이 담담하게 본다',
                        scores: { giyu: 3, muichiro: 2, shinobu: 1 }
                    },
                    {
                        text: '무서우면서도 옆 사람을 걱정하며 챙긴다',
                        scores: { tanjiro: 3, nezuko: 2, mitsuri: 1 }
                    }
                ]
            },
            {
                id: 6,
                text: '맛집에 갔을 때 나의 스타일은?',
                options: [
                    {
                        text: '뭐든 맛있게 먹는다! 감사한 마음으로 식사',
                        scores: { tanjiro: 3, rengoku: 2, mitsuri: 1 }
                    },
                    {
                        text: '인스타 감성 사진부터 찍고 먹는다',
                        scores: { tengen: 3, mitsuri: 2, zenitsu: 1 }
                    },
                    {
                        text: '남들보다 빠르게 먹고 추가 주문한다',
                        scores: { inosuke: 3, rengoku: 2, nezuko: 1 }
                    },
                    {
                        text: '조용히 음미하면서 먹는 미식가 스타일',
                        scores: { shinobu: 3, giyu: 2, muichiro: 1 }
                    }
                ]
            },
            {
                id: 7,
                text: '후배가 실수를 했을 때 나의 반응은?',
                options: [
                    {
                        text: '따뜻하게 위로하고 다시 할 수 있다고 격려한다',
                        scores: { tanjiro: 3, mitsuri: 2, rengoku: 1 }
                    },
                    {
                        text: '웃으면서 괜찮다고 하지만 속으로 아쉬워한다',
                        scores: { shinobu: 3, nezuko: 2, muichiro: 1 }
                    },
                    {
                        text: '직접 보여주면서 올바른 방법을 가르친다',
                        scores: { rengoku: 3, giyu: 2, tengen: 1 }
                    },
                    {
                        text: '실수에서 배우는 거라며 대수롭지 않게 넘긴다',
                        scores: { muichiro: 3, inosuke: 2, zenitsu: 1 }
                    }
                ]
            },
            {
                id: 8,
                text: '내가 가장 듣고 싶은 칭찬은?',
                options: [
                    {
                        text: '"넌 정말 따뜻한 사람이야"',
                        scores: { tanjiro: 3, nezuko: 2, mitsuri: 1 }
                    },
                    {
                        text: '"넌 정말 강하고 멋있어"',
                        scores: { inosuke: 3, rengoku: 2, giyu: 1 }
                    },
                    {
                        text: '"넌 정말 똑똑하고 대단해"',
                        scores: { shinobu: 3, muichiro: 2, giyu: 1 }
                    },
                    {
                        text: '"넌 정말 화려하고 매력적이야"',
                        scores: { tengen: 3, mitsuri: 2, zenitsu: 1 }
                    }
                ]
            },
            {
                id: 9,
                text: '잠들기 전 주로 하는 것은?',
                options: [
                    {
                        text: '내일 할 일을 생각하며 계획을 세운다',
                        scores: { giyu: 3, shinobu: 2, tanjiro: 1 }
                    },
                    {
                        text: '이불 속에서 폰 보다가 잠든다',
                        scores: { zenitsu: 3, muichiro: 2, nezuko: 1 }
                    },
                    {
                        text: '운동이나 스트레칭으로 하루를 마무리한다',
                        scores: { rengoku: 3, inosuke: 2, tengen: 1 }
                    },
                    {
                        text: '좋아하는 사람들에게 연락하며 수다를 떤다',
                        scores: { mitsuri: 3, tanjiro: 2, nezuko: 1 }
                    }
                ]
            },
            {
                id: 10,
                text: '단체 사진을 찍을 때 나의 포지션은?',
                options: [
                    {
                        text: '한가운데서 환하게 웃는다',
                        scores: { tanjiro: 3, rengoku: 2, mitsuri: 1 }
                    },
                    {
                        text: '가장자리에서 쿨하게 포즈를 취한다',
                        scores: { giyu: 3, muichiro: 2, shinobu: 1 }
                    },
                    {
                        text: '독특한 포즈나 재미있는 표정을 짓는다',
                        scores: { inosuke: 3, tengen: 2, zenitsu: 1 }
                    },
                    {
                        text: '옆 사람과 다정하게 붙어서 찍는다',
                        scores: { nezuko: 3, mitsuri: 2, zenitsu: 1 }
                    }
                ]
            },
            {
                id: 11,
                text: '갈등 상황에서 나의 해결 방식은?',
                options: [
                    {
                        text: '대화로 서로의 입장을 이해하려고 노력한다',
                        scores: { tanjiro: 3, mitsuri: 2, nezuko: 1 }
                    },
                    {
                        text: '직접 부딪혀서 확실하게 해결한다',
                        scores: { inosuke: 3, rengoku: 2, tengen: 1 }
                    },
                    {
                        text: '한 발짝 물러서서 시간이 해결해주길 기다린다',
                        scores: { giyu: 3, muichiro: 2, zenitsu: 1 }
                    },
                    {
                        text: '겉으로는 웃으며 넘기지만 나만의 방식으로 정리한다',
                        scores: { shinobu: 3, nezuko: 2, muichiro: 1 }
                    }
                ]
            },
            {
                id: 12,
                text: '인생에서 절대 포기할 수 없는 것은?',
                options: [
                    {
                        text: '사랑하는 가족과 친구들',
                        scores: { tanjiro: 3, nezuko: 2, mitsuri: 1 }
                    },
                    {
                        text: '나 자신의 성장과 강해지는 것',
                        scores: { inosuke: 3, giyu: 2, muichiro: 1 }
                    },
                    {
                        text: '올바른 일을 하겠다는 신념',
                        scores: { rengoku: 3, shinobu: 2, tanjiro: 1 }
                    },
                    {
                        text: '화려하고 즐거운 삶',
                        scores: { tengen: 3, zenitsu: 2, mitsuri: 1 }
                    }
                ]
            }
        ],
        results: {
            tanjiro: {
                emoji: '🌊',
                name: '탄지로',
                title: '한없이 따뜻한 물의 검사',
                desc: '당신은 누구보다 따뜻한 마음을 가진 사람입니다. 어려운 상황에서도 상대의 입장을 이해하려 노력하며, 가족과 동료를 위해서라면 어떤 고난도 견딜 수 있습니다. 그 선한 마음이야말로 당신의 가장 강력한 무기입니다.',
                traits: ['한없이 깊은 공감 능력', '가족과 동료를 향한 헌신', '어떤 역경에도 굴하지 않는 의지']
            },
            nezuko: {
                emoji: '🌸',
                name: '네즈코',
                title: '묵묵히 지키는 사랑의 수호자',
                desc: '당신은 말보다 행동으로 사랑을 표현하는 사람입니다. 겉으로는 조용하지만 소중한 사람을 위해서라면 누구보다 강해질 수 있습니다. 순수하고 결의에 찬 당신의 모습은 주변 사람들에게 큰 힘이 됩니다.',
                traits: ['말보다 행동으로 보여주는 사랑', '조용하지만 강인한 내면', '순수하고 흔들리지 않는 결의']
            },
            zenitsu: {
                emoji: '⚡',
                name: '젠이츠',
                title: '겁쟁이 속 숨겨진 번개',
                desc: '당신은 평소에는 겁이 많고 걱정이 많은 편이지만, 정말 중요한 순간에는 놀라운 잠재력을 발휘하는 사람입니다. 감정이 풍부하고 솔직해서 주변에 웃음을 주며, 한번 마음먹으면 놀라운 집중력을 보여줍니다.',
                traits: ['위기에서 빛나는 숨겨진 실력', '솔직하고 풍부한 감정 표현', '사랑하는 사람을 향한 일편단심']
            },
            inosuke: {
                emoji: '🐗',
                name: '이노스케',
                title: '본능에 충실한 야생의 전사',
                desc: '당신은 자유롭고 거침없는 성격의 소유자입니다. 도전을 두려워하지 않으며 항상 앞으로 나아가려는 강한 의지가 있습니다. 겉으로는 거칠어 보이지만 동료들과의 우정을 소중히 여기는 따뜻한 면도 있습니다.',
                traits: ['두려움 없는 도전 정신', '야생적인 직감과 생존력', '거친 외면 속 따뜻한 동료애']
            },
            giyu: {
                emoji: '🌀',
                name: '기유',
                title: '과묵한 물의 기둥',
                desc: '당신은 말이 적고 표현이 서툴지만 깊은 신념과 실력을 가진 사람입니다. 혼자 있는 시간을 좋아하며 자기만의 기준이 확고합니다. 겉으로는 무뚝뚝해 보이지만 동료를 위해 묵묵히 헌신하는 믿음직한 존재입니다.',
                traits: ['과묵하지만 확고한 신념', '뛰어난 실력과 차분한 판단력', '표현은 서툴지만 깊은 동료애']
            },
            rengoku: {
                emoji: '🔥',
                name: '렌고쿠',
                title: '타오르는 불꽃의 리더',
                desc: '당신은 뜨거운 열정과 강한 책임감을 가진 천생 리더입니다. 항상 밝고 긍정적이며 자신의 신념을 끝까지 관철하는 강인함이 있습니다. 후배들에게 존경받는 멘토이자 어떤 상황에서도 앞장서는 용감한 사람입니다.',
                traits: ['타오르는 열정과 긍정 에너지', '후배를 이끄는 리더십과 멘토십', '끝까지 관철하는 강인한 신념']
            },
            shinobu: {
                emoji: '🦋',
                name: '시노부',
                title: '미소 뒤에 숨겨진 독나비',
                desc: '당신은 항상 미소를 짓고 있지만 속마음을 쉽게 드러내지 않는 복잡한 내면의 소유자입니다. 지적이고 전략적이며 목표를 위해 치밀하게 행동합니다. 부드러운 겉모습과 달리 강한 의지와 날카로운 지성을 갖추고 있습니다.',
                traits: ['미소 뒤에 감춰진 깊은 내면', '지적이고 전략적인 사고방식', '부드럽지만 단호한 행동력']
            },
            mitsuri: {
                emoji: '💗',
                name: '미츠리',
                title: '사랑이 넘치는 연애 기둥',
                desc: '당신은 사랑과 애정이 넘치는 따뜻한 사람입니다. 감수성이 풍부하고 다른 사람의 장점을 잘 발견하며, 누구에게나 친절합니다. 겉으로는 여리어 보이지만 사랑하는 것을 지키기 위한 강한 힘을 가지고 있습니다.',
                traits: ['넘치는 애정과 따뜻한 마음', '타인의 장점을 발견하는 눈', '사랑을 지키는 숨겨진 강인함']
            },
            muichiro: {
                emoji: '🌫',
                name: '무이치로',
                title: '안개 속 천재 검사',
                desc: '당신은 멍하게 보이지만 실제로는 뛰어난 재능을 가진 천재 타입입니다. 관심 있는 일에는 놀라운 집중력을 발휘하며, 자기만의 페이스를 절대 잃지 않습니다. 독특한 감성과 직관력으로 남들이 보지 못하는 것을 포착합니다.',
                traits: ['멍한 듯 보이는 천재적 재능', '자기만의 페이스를 지키는 힘', '독특한 직관력과 감성']
            },
            tengen: {
                emoji: '💎',
                name: '우즈이 텐겐',
                title: '화려함의 끝판왕',
                desc: '당신은 삶을 화려하고 멋지게 사는 것을 추구하는 사람입니다. 자신감이 넘치며 어떤 상황에서든 존재감을 발휘합니다. 파티의 중심이며 트렌드에 민감하고, 소중한 사람들에게는 누구보다 든든한 존재입니다.',
                traits: ['압도적인 자신감과 존재감', '화려한 라이프스타일 추구', '소중한 사람을 향한 든든한 보호']
            }
        }
    },

    // ============================================================
    // TEST 3: 원피스 성격 테스트
    // ============================================================
    {
        id: 'onepiece',
        title: '나는 원피스 누구일까?',
        subtitle: '12가지 질문으로 알아보는 나의 원피스 캐릭터',
        emoji: '🏴‍☠️',
        color: '#e67e22',
        questionCount: 12,
        resultCount: 10,
        questions: [
            {
                id: 1,
                text: '꿈을 이루기 위해 가장 중요한 것은?',
                options: [
                    {
                        text: '절대 포기하지 않는 의지와 자유',
                        scores: { luffy: 3, ace: 2, franky: 1 }
                    },
                    {
                        text: '목표를 향한 끊임없는 수련과 노력',
                        scores: { zoro: 3, sanji: 2, chopper: 1 }
                    },
                    {
                        text: '정보와 지식, 그리고 똑똑한 전략',
                        scores: { nami: 3, robin: 2, usopp: 1 }
                    },
                    {
                        text: '함께하는 동료들과의 우정',
                        scores: { chopper: 3, brook: 2, franky: 1 }
                    }
                ]
            },
            {
                id: 2,
                text: '친구가 곤경에 처했을 때 나는?',
                options: [
                    {
                        text: '이유 묻지 않고 바로 달려간다',
                        scores: { luffy: 3, ace: 2, sanji: 1 }
                    },
                    {
                        text: '침착하게 상황을 파악하고 최선의 방법을 찾는다',
                        scores: { robin: 3, nami: 2, chopper: 1 }
                    },
                    {
                        text: '무섭지만 용기를 내서 도우러 간다',
                        scores: { usopp: 3, chopper: 2, brook: 1 }
                    },
                    {
                        text: '내가 앞장서서 길을 뚫어준다',
                        scores: { zoro: 3, franky: 2, ace: 1 }
                    }
                ]
            },
            {
                id: 3,
                text: '파티에서 나의 역할은?',
                options: [
                    {
                        text: '신나게 먹고 마시며 분위기를 띄운다',
                        scores: { luffy: 3, franky: 2, brook: 1 }
                    },
                    {
                        text: '맛있는 요리를 만들어서 대접한다',
                        scores: { sanji: 3, nami: 2, chopper: 1 }
                    },
                    {
                        text: '노래나 악기 연주로 흥을 돋운다',
                        scores: { brook: 3, franky: 2, usopp: 1 }
                    },
                    {
                        text: '한쪽에서 조용히 즐기며 관찰한다',
                        scores: { robin: 3, zoro: 2, ace: 1 }
                    }
                ]
            },
            {
                id: 4,
                text: '돈이 아주 많이 생긴다면?',
                options: [
                    {
                        text: '전부 저축하거나 투자한다! 돈은 소중하니까',
                        scores: { nami: 3, robin: 2, usopp: 1 }
                    },
                    {
                        text: '좋아하는 것에 아낌없이 쓴다',
                        scores: { luffy: 3, franky: 2, ace: 1 }
                    },
                    {
                        text: '소중한 사람들을 위해 쓴다',
                        scores: { sanji: 3, chopper: 2, brook: 1 }
                    },
                    {
                        text: '더 강해지기 위한 장비나 훈련에 투자한다',
                        scores: { zoro: 3, ace: 2, franky: 1 }
                    }
                ]
            },
            {
                id: 5,
                text: '나의 약점은 무엇인가요?',
                options: [
                    {
                        text: '너무 무모하고 생각 없이 돌진하는 것',
                        scores: { luffy: 3, ace: 2, zoro: 1 }
                    },
                    {
                        text: '겁이 많고 자신감이 부족한 것',
                        scores: { usopp: 3, chopper: 2, brook: 1 }
                    },
                    {
                        text: '가끔 너무 냉정하거나 고집이 센 것',
                        scores: { zoro: 3, robin: 2, nami: 1 }
                    },
                    {
                        text: '이성 앞에서 이성을 잃는 것',
                        scores: { sanji: 3, brook: 2, franky: 1 }
                    }
                ]
            },
            {
                id: 6,
                text: '새로운 섬(장소)에 도착했을 때 가장 먼저 하는 것은?',
                options: [
                    {
                        text: '모험! 구석구석 탐험하러 뛰어간다',
                        scores: { luffy: 3, chopper: 2, usopp: 1 }
                    },
                    {
                        text: '맛집부터 찾는다',
                        scores: { sanji: 3, luffy: 2, nami: 1 }
                    },
                    {
                        text: '그 장소의 역사와 문화를 조사한다',
                        scores: { robin: 3, nami: 2, brook: 1 }
                    },
                    {
                        text: '조용한 곳을 찾아서 낮잠을 잔다',
                        scores: { zoro: 3, ace: 2, franky: 1 }
                    }
                ]
            },
            {
                id: 7,
                text: '팀에서 맡고 싶은 포지션은?',
                options: [
                    {
                        text: '방향을 정하는 선장(리더)',
                        scores: { luffy: 3, ace: 2, zoro: 1 }
                    },
                    {
                        text: '전략을 짜는 참모(항해사)',
                        scores: { nami: 3, robin: 2, usopp: 1 }
                    },
                    {
                        text: '묵묵히 실력으로 보여주는 전투원',
                        scores: { zoro: 3, sanji: 2, franky: 1 }
                    },
                    {
                        text: '팀의 분위기를 만드는 무드메이커',
                        scores: { brook: 3, chopper: 2, franky: 1 }
                    }
                ]
            },
            {
                id: 8,
                text: '거짓말에 대한 나의 생각은?',
                options: [
                    {
                        text: '거짓말은 절대 안 한다! 솔직한 게 최고',
                        scores: { luffy: 3, zoro: 2, ace: 1 }
                    },
                    {
                        text: '상황에 따라 필요한 거짓말도 있다',
                        scores: { nami: 3, robin: 2, sanji: 1 }
                    },
                    {
                        text: '이야기를 재미있게 부풀리는 건 좋아한다',
                        scores: { usopp: 3, brook: 2, franky: 1 }
                    },
                    {
                        text: '남을 위한 거짓말이라면 기꺼이 한다',
                        scores: { sanji: 3, chopper: 2, robin: 1 }
                    }
                ]
            },
            {
                id: 9,
                text: '나의 전투 스타일은?',
                options: [
                    {
                        text: '파워! 정면 돌파로 부딪힌다',
                        scores: { luffy: 3, franky: 2, ace: 1 }
                    },
                    {
                        text: '칼 같은 기술과 정확한 공격',
                        scores: { zoro: 3, sanji: 2, brook: 1 }
                    },
                    {
                        text: '머리를 써서 함정이나 전략으로 이긴다',
                        scores: { usopp: 3, nami: 2, robin: 1 }
                    },
                    {
                        text: '동료를 치료하고 서포트하는 역할',
                        scores: { chopper: 3, robin: 2, brook: 1 }
                    }
                ]
            },
            {
                id: 10,
                text: '슬플 때 나는 어떻게 하나요?',
                options: [
                    {
                        text: '울고 싶을 때는 실컷 운다! 그리고 다시 웃는다',
                        scores: { luffy: 3, franky: 2, chopper: 1 }
                    },
                    {
                        text: '혼자 조용히 삭이며 이겨낸다',
                        scores: { zoro: 3, robin: 2, ace: 1 }
                    },
                    {
                        text: '음악이나 취미로 기분을 전환한다',
                        scores: { brook: 3, usopp: 2, nami: 1 }
                    },
                    {
                        text: '맛있는 것을 먹으면 기분이 나아진다',
                        scores: { sanji: 3, luffy: 2, chopper: 1 }
                    }
                ]
            },
            {
                id: 11,
                text: '내가 가장 싫어하는 것은?',
                options: [
                    {
                        text: '자유를 빼앗기는 것',
                        scores: { luffy: 3, ace: 2, franky: 1 }
                    },
                    {
                        text: '음식을 낭비하는 것',
                        scores: { sanji: 3, luffy: 2, chopper: 1 }
                    },
                    {
                        text: '약한 자를 괴롭히는 것',
                        scores: { chopper: 3, usopp: 2, nami: 1 }
                    },
                    {
                        text: '진실이 묻히는 것',
                        scores: { robin: 3, zoro: 2, brook: 1 }
                    }
                ]
            },
            {
                id: 12,
                text: '10년 후 나의 모습은?',
                options: [
                    {
                        text: '세계 어딘가에서 자유롭게 모험하고 있다',
                        scores: { luffy: 3, ace: 2, brook: 1 }
                    },
                    {
                        text: '자기 분야에서 최고가 되어 있다',
                        scores: { zoro: 3, sanji: 2, nami: 1 }
                    },
                    {
                        text: '사랑하는 사람들과 행복하게 지내고 있다',
                        scores: { chopper: 3, usopp: 2, franky: 1 }
                    },
                    {
                        text: '아직 모르는 진실과 지식을 탐구하고 있다',
                        scores: { robin: 3, nami: 2, brook: 1 }
                    }
                ]
            }
        ],
        results: {
            luffy: {
                emoji: '🍖',
                name: '루피',
                title: '자유를 사랑하는 고무 선장',
                desc: '당신은 자유를 무엇보다 소중히 여기는 천성의 리더입니다. 복잡한 것은 싫어하고 직감으로 움직이지만, 그 단순함이 오히려 사람들의 마음을 움직이는 힘이 됩니다. 동료를 위해서라면 세상 무엇과도 맞서 싸울 수 있는 용기의 소유자입니다.',
                traits: ['자유를 향한 끝없는 열망', '동료를 향한 무조건적인 신뢰', '단순하지만 강력한 카리스마']
            },
            zoro: {
                emoji: '⚔️',
                name: '조로',
                title: '세계 최강을 향한 삼도류 검사',
                desc: '당신은 목표를 향해 묵묵히 나아가는 강인한 의지의 소유자입니다. 말보다 행동으로 보여주며, 한번 정한 약속은 반드시 지킵니다. 방향치 기질이 있지만 진정 중요한 순간에는 절대 길을 잃지 않는 믿음직한 사람입니다.',
                traits: ['흔들리지 않는 강철 의지', '말보다 행동으로 증명하는 성격', '의리와 약속을 목숨처럼 지키는 신념']
            },
            nami: {
                emoji: '🍊',
                name: '나미',
                title: '똑똑한 전략가이자 항해사',
                desc: '당신은 뛰어난 상황 판단력과 현실 감각을 가진 사람입니다. 돈과 자원 관리에 탁월하며 항상 최선의 결과를 이끌어냅니다. 겉으로는 강해 보이지만 소중한 사람들을 위해서는 누구보다 헌신적인 따뜻한 마음을 가지고 있습니다.',
                traits: ['탁월한 상황 판단과 전략', '현실적이고 실용적인 사고', '강한 겉모습 속 따뜻한 마음']
            },
            usopp: {
                emoji: '🎯',
                name: '우솝',
                title: '용감한 저격왕을 꿈꾸는 이야기꾼',
                desc: '당신은 겁이 많지만 그래서 더 용감한 사람입니다. 풍부한 상상력과 창의력으로 위기를 기발하게 극복하며, 이야기를 재미있게 풀어내는 재주가 있습니다. 진정한 용기란 두려움을 아는 것이라는 걸 몸소 보여주는 사람입니다.',
                traits: ['두려움을 이기는 진정한 용기', '풍부한 상상력과 창의력', '위기에서 빛나는 기발한 아이디어']
            },
            sanji: {
                emoji: '🍳',
                name: '상디',
                title: '신사적인 바다의 요리사',
                desc: '당신은 다재다능하고 로맨틱한 사람입니다. 요리처럼 세심한 배려로 주변 사람들을 챙기며, 약한 자를 위해 기꺼이 나서는 기사도 정신이 있습니다. 겉으로는 여유로워 보이지만 동료를 위해서는 자신을 희생할 수 있는 깊은 사람입니다.',
                traits: ['세심한 배려와 신사적 매너', '뛰어난 요리 실력과 미적 감각', '동료를 위한 자기 희생 정신']
            },
            chopper: {
                emoji: '🩺',
                name: '쵸파',
                title: '세상 모든 병을 고치고 싶은 의사',
                desc: '당신은 순수하고 따뜻한 마음의 소유자입니다. 다른 사람의 아픔에 공감하는 능력이 뛰어나며 항상 도움이 되고 싶어합니다. 작은 체구지만 큰 꿈을 품고 있으며, 동료들과 함께할 때 가장 빛나는 사람입니다.',
                traits: ['순수하고 따뜻한 공감 능력', '누군가를 돕고 싶은 마음', '작지만 원대한 꿈과 성장']
            },
            robin: {
                emoji: '📚',
                name: '로빈',
                title: '진실을 찾아 떠나는 고고학자',
                desc: '당신은 지적이고 차분한 성격의 소유자입니다. 역사와 지식에 대한 끝없는 탐구심을 가지고 있으며, 어떤 상황에서도 냉정함을 유지합니다. 과거의 아픔을 딛고 일어선 강인함이 있으며, 신뢰하는 동료에게는 한없이 다정합니다.',
                traits: ['끝없는 지적 탐구심', '어떤 상황에서도 유지하는 냉정함', '아픔을 딛고 일어선 내면의 강인함']
            },
            franky: {
                emoji: '🤖',
                name: '프랑키',
                title: '꿈을 만드는 변태 천재 조선공',
                desc: '당신은 창의적이고 열정 넘치는 감성적 장인입니다. 뭔가를 만들고 완성하는 것에서 큰 기쁨을 느끼며, 감동적인 이야기에 쉽게 눈물을 흘리는 따뜻한 사람입니다. 겉은 터프하지만 속은 누구보다 여린 반전 매력의 소유자입니다.',
                traits: ['뛰어난 기술력과 창의성', '감동에 약한 뜨거운 감성', '터프한 겉모습과 여린 내면의 반전']
            },
            brook: {
                emoji: '🎵',
                name: '브룩',
                title: '음악을 사랑하는 영혼의 기사',
                desc: '당신은 유머와 음악으로 사람들에게 행복을 주는 존재입니다. 가벼워 보이지만 오랜 세월의 경험에서 나오는 깊은 지혜가 있습니다. 약속을 끝까지 지키는 의리 있는 성격이며, 어떤 상황에서도 유쾌함을 잃지 않는 긍정의 아이콘입니다.',
                traits: ['유머와 음악으로 채우는 일상', '오랜 경험에서 나오는 깊은 지혜', '끝까지 지키는 약속과 의리']
            },
            ace: {
                emoji: '🔥',
                name: '에이스',
                title: '자유로운 불꽃의 형',
                desc: '당신은 자유분방하면서도 깊은 유대감을 중요시하는 사람입니다. 형제나 가족 같은 소중한 관계를 위해서라면 무엇이든 할 수 있으며, 카리스마와 따뜻함을 동시에 가진 매력적인 사람입니다. 자신만의 존재 이유를 찾으려 노력하는 깊이 있는 성격입니다.',
                traits: ['자유로우면서도 깊은 유대감', '형제와 동료를 향한 헌신', '존재의 의미를 찾아가는 깊이']
            }
        }
    },

    // ============================================================
    // TEST 4: 해리포터 기숙사 배정 테스트
    // ============================================================
    {
        id: 'harry-potter',
        title: '나의 호그와트 기숙사는?',
        subtitle: '12가지 질문으로 알아보는 마법사 기숙사 배정',
        emoji: '🧙',
        color: '#9b59b6',
        questionCount: 12,
        resultCount: 4,
        questions: [
            {
                id: 1,
                text: '길을 걷다가 지갑을 주웠습니다. 어떻게 하나요?',
                options: [
                    {
                        text: '즉시 경찰서에 가져다준다. 당연히 해야 할 일이니까',
                        scores: { hufflepuff: 3, gryffindor: 1 }
                    },
                    {
                        text: '안에 연락처가 있는지 확인하고 직접 돌려준다',
                        scores: { gryffindor: 3, hufflepuff: 1 }
                    },
                    {
                        text: '주변 CCTV 위치를 확인하고 가장 효율적인 방법으로 돌려준다',
                        scores: { ravenclaw: 3, slytherin: 1 }
                    },
                    {
                        text: '일단 보관하고 있다가 주인이 찾으면 돌려준다',
                        scores: { slytherin: 3, ravenclaw: 1 }
                    }
                ]
            },
            {
                id: 2,
                text: '시험 기간에 나의 공부 스타일은?',
                options: [
                    {
                        text: '완벽한 계획표를 만들고 체계적으로 공부한다',
                        scores: { ravenclaw: 3, slytherin: 1 }
                    },
                    {
                        text: '친구들과 스터디 그룹을 만들어 함께 공부한다',
                        scores: { hufflepuff: 3, gryffindor: 1 }
                    },
                    {
                        text: '벼락치기! 집중력으로 한방에 승부한다',
                        scores: { gryffindor: 3, slytherin: 1 }
                    },
                    {
                        text: '효율적인 핵심 정리로 최소 노력 최대 효과를 노린다',
                        scores: { slytherin: 3, ravenclaw: 1 }
                    }
                ]
            },
            {
                id: 3,
                text: '마법 능력 하나를 가질 수 있다면?',
                options: [
                    {
                        text: '시간을 되돌리는 타임터너',
                        scores: { ravenclaw: 3, slytherin: 1 }
                    },
                    {
                        text: '어디든 갈 수 있는 순간이동',
                        scores: { gryffindor: 3, ravenclaw: 1 }
                    },
                    {
                        text: '마음을 읽는 투시 능력',
                        scores: { slytherin: 3, hufflepuff: 1 }
                    },
                    {
                        text: '상처를 치유하는 힐링 마법',
                        scores: { hufflepuff: 3, gryffindor: 1 }
                    }
                ]
            },
            {
                id: 4,
                text: '친구가 규칙을 어기려고 합니다. 나의 반응은?',
                options: [
                    {
                        text: '위험할 수 있으니 말리지만, 그래도 간다면 함께 간다',
                        scores: { gryffindor: 3, hufflepuff: 1 }
                    },
                    {
                        text: '규칙을 어기는 건 옳지 않다고 설득한다',
                        scores: { hufflepuff: 3, ravenclaw: 1 }
                    },
                    {
                        text: '들키지 않을 완벽한 계획이 있다면 함께한다',
                        scores: { slytherin: 3, gryffindor: 1 }
                    },
                    {
                        text: '왜 규칙을 어기려는지 이유를 먼저 분석한다',
                        scores: { ravenclaw: 3, slytherin: 1 }
                    }
                ]
            },
            {
                id: 5,
                text: '리더가 되었을 때 나의 리더십 스타일은?',
                options: [
                    {
                        text: '앞장서서 위험을 감수하며 팀을 이끈다',
                        scores: { gryffindor: 3, slytherin: 1 }
                    },
                    {
                        text: '모두의 의견을 듣고 공정하게 결정한다',
                        scores: { hufflepuff: 3, ravenclaw: 1 }
                    },
                    {
                        text: '데이터와 논리로 최적의 방향을 제시한다',
                        scores: { ravenclaw: 3, hufflepuff: 1 }
                    },
                    {
                        text: '적재적소에 사람을 배치하고 결과로 보여준다',
                        scores: { slytherin: 3, gryffindor: 1 }
                    }
                ]
            },
            {
                id: 6,
                text: '가장 두려운 것은?',
                options: [
                    {
                        text: '사랑하는 사람을 지키지 못하는 것',
                        scores: { gryffindor: 3, hufflepuff: 1 }
                    },
                    {
                        text: '모든 사람에게 배신당하고 혼자 남는 것',
                        scores: { hufflepuff: 3, slytherin: 1 }
                    },
                    {
                        text: '무지하고 어리석은 사람이 되는 것',
                        scores: { ravenclaw: 3, gryffindor: 1 }
                    },
                    {
                        text: '아무런 성취 없이 평범하게 사라지는 것',
                        scores: { slytherin: 3, ravenclaw: 1 }
                    }
                ]
            },
            {
                id: 7,
                text: '주말에 가장 하고 싶은 활동은?',
                options: [
                    {
                        text: '새로운 액티비티나 스포츠 도전하기',
                        scores: { gryffindor: 3, hufflepuff: 1 }
                    },
                    {
                        text: '좋아하는 사람들과 브런치 먹기',
                        scores: { hufflepuff: 3, gryffindor: 1 }
                    },
                    {
                        text: '서점이나 도서관에서 책에 빠지기',
                        scores: { ravenclaw: 3, hufflepuff: 1 }
                    },
                    {
                        text: '자기 계발이나 미래 계획 세우기',
                        scores: { slytherin: 3, ravenclaw: 1 }
                    }
                ]
            },
            {
                id: 8,
                text: '불공정한 상황을 목격했을 때?',
                options: [
                    {
                        text: '즉시 나서서 잘못된 점을 지적한다',
                        scores: { gryffindor: 3, hufflepuff: 1 }
                    },
                    {
                        text: '피해자의 편에 서서 조용히 도와준다',
                        scores: { hufflepuff: 3, gryffindor: 1 }
                    },
                    {
                        text: '근본적인 원인을 파악하고 구조적 해결을 모색한다',
                        scores: { ravenclaw: 3, slytherin: 1 }
                    },
                    {
                        text: '적절한 타이밍에 가장 효과적인 방법으로 개입한다',
                        scores: { slytherin: 3, ravenclaw: 1 }
                    }
                ]
            },
            {
                id: 9,
                text: '나를 가장 잘 설명하는 문장은?',
                options: [
                    {
                        text: '"두려워도 옳은 일을 한다"',
                        scores: { gryffindor: 3, hufflepuff: 1 }
                    },
                    {
                        text: '"모두에게 공정하고 성실하게 대한다"',
                        scores: { hufflepuff: 3, ravenclaw: 1 }
                    },
                    {
                        text: '"배움에는 끝이 없다"',
                        scores: { ravenclaw: 3, gryffindor: 1 }
                    },
                    {
                        text: '"원하는 것은 반드시 이룬다"',
                        scores: { slytherin: 3, ravenclaw: 1 }
                    }
                ]
            },
            {
                id: 10,
                text: '호그와트에서 가장 좋아할 수업은?',
                options: [
                    {
                        text: '어둠의 마법 방어술 - 실전 대비가 중요하니까!',
                        scores: { gryffindor: 3, slytherin: 1 }
                    },
                    {
                        text: '약초학 - 생명을 다루는 따뜻한 마법',
                        scores: { hufflepuff: 3, ravenclaw: 1 }
                    },
                    {
                        text: '마법의 역사 - 과거에서 배우는 지혜',
                        scores: { ravenclaw: 3, hufflepuff: 1 }
                    },
                    {
                        text: '마법약 - 정밀하고 강력한 결과물을 만드는 재미',
                        scores: { slytherin: 3, ravenclaw: 1 }
                    }
                ]
            },
            {
                id: 11,
                text: '성공의 가장 중요한 요소는?',
                options: [
                    {
                        text: '위험을 감수할 줄 아는 용기',
                        scores: { gryffindor: 3, slytherin: 1 }
                    },
                    {
                        text: '포기하지 않는 꾸준함과 성실함',
                        scores: { hufflepuff: 3, gryffindor: 1 }
                    },
                    {
                        text: '지식과 창의적인 문제 해결 능력',
                        scores: { ravenclaw: 3, hufflepuff: 1 }
                    },
                    {
                        text: '목표를 향한 야망과 전략',
                        scores: { slytherin: 3, ravenclaw: 1 }
                    }
                ]
            },
            {
                id: 12,
                text: '졸업 후 마법 세계에서 하고 싶은 직업은?',
                options: [
                    {
                        text: '어둠의 마법사를 잡는 오러(마법 경찰)',
                        scores: { gryffindor: 3, slytherin: 1 }
                    },
                    {
                        text: '마법 동물을 돌보는 신비한 동물학자',
                        scores: { hufflepuff: 3, ravenclaw: 1 }
                    },
                    {
                        text: '새로운 마법을 연구하는 마법 학자',
                        scores: { ravenclaw: 3, hufflepuff: 1 }
                    },
                    {
                        text: '마법부 장관이 되어 세상을 바꾸는 정치가',
                        scores: { slytherin: 3, gryffindor: 1 }
                    }
                ]
            }
        ],
        results: {
            gryffindor: {
                emoji: '🦁',
                name: '그리핀도르',
                title: '용기와 기사도의 기숙사',
                desc: '당신은 옳다고 믿는 일을 위해 두려움 없이 나서는 용감한 사람입니다. 불의를 보면 참지 못하고, 위험한 상황에서도 소중한 사람을 지키기 위해 앞장섭니다. 때론 무모해 보이지만, 그 용기가 세상을 바꾸는 원동력이 됩니다.',
                traits: ['두려움을 이기는 용기', '정의를 향한 불굴의 의지', '동료를 위한 기사도 정신']
            },
            slytherin: {
                emoji: '🐍',
                name: '슬리데린',
                title: '야망과 지략의 기숙사',
                desc: '당신은 목표를 향해 치밀한 계획을 세우는 전략적인 사람입니다. 강한 야망과 리더십을 가지고 있으며, 원하는 것을 얻기 위해 최선의 방법을 찾아냅니다. 냉정해 보이지만 자신의 사람에게는 누구보다 든든한 존재입니다.',
                traits: ['뚜렷한 목표와 강한 야망', '뛰어난 전략과 처세술', '자기 사람을 지키는 충성심']
            },
            ravenclaw: {
                emoji: '🦅',
                name: '래번클로',
                title: '지혜와 창의의 기숙사',
                desc: '당신은 끊임없이 배우고 탐구하는 지적 호기심의 소유자입니다. 논리적이고 분석적인 사고를 즐기며, 독창적인 아이디어로 문제를 해결합니다. 독립적인 성향이 강하며 자신만의 세계에서 깊이 있는 사고를 즐기는 사람입니다.',
                traits: ['끝없는 지적 호기심과 탐구심', '논리적이고 창의적인 사고', '독립적이고 개성 있는 성향']
            },
            hufflepuff: {
                emoji: '🦡',
                name: '후플푸프',
                title: '성실과 우정의 기숙사',
                desc: '당신은 성실하고 공정하며 누구에게나 따뜻한 사람입니다. 묵묵히 노력하며 주변 사람들을 소중히 여기고, 어떤 상황에서도 정직함을 잃지 않습니다. 화려하지 않지만 가장 든든하고 신뢰할 수 있는 사람이야말로 당신입니다.',
                traits: ['흔들리지 않는 성실함과 끈기', '모두를 포용하는 따뜻한 마음', '공정하고 정직한 성품']
            }
        }
    },

    // ============================================================
    // TEST 5: 디즈니 캐릭터 테스트
    // ============================================================
    {
        id: 'disney',
        title: '나의 디즈니 캐릭터는?',
        subtitle: '12가지 질문으로 찾는 나와 닮은 디즈니 캐릭터',
        emoji: '👸',
        color: '#3498db',
        tag: '디즈니',
        questionCount: 12,
        resultCount: 10,
        questions: [
            {
                text: '새로운 도전 앞에서 나의 태도는?',
                options: [
                    { text: '두려워도 일단 부딪혀본다', scores: { moana: 3, mulan: 2 } },
                    { text: '충분히 준비하고 나서 시작한다', scores: { belle: 3, elsa: 1 } },
                    { text: '주변 사람들과 상의하고 함께 간다', scores: { rapunzel: 2, mirabel: 2 } },
                    { text: '나만의 직감을 믿고 따른다', scores: { ariel: 3, jasmine: 1 } }
                ]
            },
            {
                text: '나에게 가장 중요한 가치는?',
                options: [
                    { text: '가족과의 유대', scores: { mirabel: 3, mulan: 2 } },
                    { text: '자유와 모험', scores: { ariel: 3, moana: 2 } },
                    { text: '지식과 성장', scores: { belle: 3, rapunzel: 1 } },
                    { text: '자아 발견과 내면의 힘', scores: { elsa: 3, merida: 1 } }
                ]
            },
            {
                text: '친구들 사이에서 나의 역할은?',
                options: [
                    { text: '분위기를 이끄는 리더', scores: { moana: 2, jasmine: 2 } },
                    { text: '묵묵히 돕는 든든한 서포터', scores: { cinderella: 3, mulan: 1 } },
                    { text: '새로운 아이디어를 제안하는 사람', scores: { rapunzel: 3, ariel: 1 } },
                    { text: '갈등을 중재하고 화합시키는 사람', scores: { mirabel: 3, belle: 1 } }
                ]
            },
            {
                text: '스트레스를 받을 때 나의 해소법은?',
                options: [
                    { text: '혼자만의 공간에서 차분히 정리', scores: { elsa: 3, belle: 1 } },
                    { text: '밖으로 나가 바람을 쐰다', scores: { merida: 3, moana: 1 } },
                    { text: '친한 사람에게 이야기한다', scores: { rapunzel: 2, mirabel: 2 } },
                    { text: '좋아하는 음악이나 취미에 몰두', scores: { ariel: 2, cinderella: 2 } }
                ]
            },
            {
                text: '이상적인 데이트 장소는?',
                options: [
                    { text: '서점이나 미술관 같은 문화 공간', scores: { belle: 3, rapunzel: 1 } },
                    { text: '바다나 산 같은 자연 속', scores: { moana: 3, ariel: 2 } },
                    { text: '이국적인 시장이나 새로운 동네 탐방', scores: { jasmine: 3, rapunzel: 1 } },
                    { text: '놀이공원이나 액티비티', scores: { merida: 2, mirabel: 2 } }
                ]
            },
            {
                text: '불합리한 규칙을 마주했을 때?',
                options: [
                    { text: '당당하게 의견을 말하고 바꾸려 한다', scores: { jasmine: 3, merida: 2 } },
                    { text: '나만의 방식으로 조용히 저항한다', scores: { mulan: 3, elsa: 1 } },
                    { text: '먼저 이유를 이해하려고 노력한다', scores: { belle: 2, cinderella: 2 } },
                    { text: '상황을 바꿀 기회가 올 때까지 기다린다', scores: { cinderella: 3, mirabel: 1 } }
                ]
            },
            {
                text: '어릴 때 가장 좋아했던 놀이는?',
                options: [
                    { text: '책 읽기나 이야기 만들기', scores: { belle: 3, rapunzel: 2 } },
                    { text: '밖에서 뛰어놀기, 탐험하기', scores: { merida: 3, moana: 1 } },
                    { text: '그림 그리기, 만들기', scores: { rapunzel: 3, ariel: 1 } },
                    { text: '역할 놀이, 상상의 세계', scores: { mirabel: 2, ariel: 2 } }
                ]
            },
            {
                text: '나를 가장 잘 표현하는 계절은?',
                options: [
                    { text: '겨울 — 고요하고 아름다운', scores: { elsa: 3, cinderella: 1 } },
                    { text: '봄 — 새롭고 활기찬', scores: { rapunzel: 3, mirabel: 1 } },
                    { text: '여름 — 뜨겁고 자유로운', scores: { moana: 2, ariel: 2 } },
                    { text: '가을 — 깊이 있고 따뜻한', scores: { belle: 2, mulan: 2 } }
                ]
            },
            {
                text: '마법의 능력을 하나 가질 수 있다면?',
                options: [
                    { text: '얼음/자연을 다루는 힘', scores: { elsa: 3, moana: 1 } },
                    { text: '동물과 대화하는 능력', scores: { cinderella: 2, ariel: 2 } },
                    { text: '치유의 힘', scores: { rapunzel: 3, mirabel: 1 } },
                    { text: '변신 또는 위장 능력', scores: { mulan: 3, jasmine: 1 } }
                ]
            },
            {
                text: '갈등 상황에서 나의 첫 번째 반응은?',
                options: [
                    { text: '감정을 숨기고 혼자 해결하려 한다', scores: { elsa: 3, mulan: 1 } },
                    { text: '정면으로 부딪혀 해결한다', scores: { merida: 3, jasmine: 1 } },
                    { text: '대화로 풀어보려 노력한다', scores: { mirabel: 3, belle: 1 } },
                    { text: '상황에서 벗어나 생각할 시간을 갖는다', scores: { ariel: 2, cinderella: 2 } }
                ]
            },
            {
                text: '가장 두려운 것은?',
                options: [
                    { text: '사랑하는 사람을 잃는 것', scores: { mulan: 2, mirabel: 2 } },
                    { text: '자유를 빼앗기는 것', scores: { ariel: 3, jasmine: 2 } },
                    { text: '나 자신을 잃어버리는 것', scores: { elsa: 3, moana: 1 } },
                    { text: '아무것도 이루지 못하는 것', scores: { rapunzel: 2, belle: 2 } }
                ]
            },
            {
                text: '행복의 비결이 뭐라고 생각하나요?',
                options: [
                    { text: '나다운 모습으로 사는 것', scores: { elsa: 2, merida: 2 } },
                    { text: '사랑하는 사람들과 함께하는 것', scores: { cinderella: 2, mirabel: 2 } },
                    { text: '새로운 세계를 경험하는 것', scores: { moana: 2, ariel: 2 } },
                    { text: '꿈을 이루어가는 과정 자체', scores: { rapunzel: 2, belle: 2 } }
                ]
            }
        ],
        results: {
            elsa: { emoji: '❄️', name: '엘사', title: '얼음 여왕의 내면의 힘', desc: '강한 내면과 독립적인 성격의 당신은 엘사와 닮았습니다. 감정을 깊이 느끼면서도 스스로 컨트롤하는 힘이 있으며, 진정한 자아를 받아들였을 때 가장 빛납니다.', traits: ['강한 자기 통제력', '깊은 내면 세계', '진정한 나를 받아들이는 용기'] },
            rapunzel: { emoji: '🌸', name: '라푼젤', title: '꿈꾸는 창의적 영혼', desc: '호기심과 창의력이 넘치는 당신은 라푼젤과 닮았습니다. 새로운 것에 대한 열정이 가득하고, 밝은 에너지로 주변을 환하게 만드는 매력의 소유자입니다.', traits: ['끝없는 호기심과 창의력', '밝고 긍정적인 에너지', '새로운 경험에 대한 열정'] },
            mulan: { emoji: '⚔️', name: '뮬란', title: '용감한 수호자', desc: '가족과 소중한 사람들을 위해 기꺼이 나서는 당신은 뮬란과 닮았습니다. 조용하지만 결정적 순간에 용기를 발휘하며, 성별이나 편견에 굴하지 않는 강인한 정신의 소유자입니다.', traits: ['소중한 것을 지키는 용기', '편견에 굴하지 않는 강인함', '겸손하면서도 단호한 리더십'] },
            moana: { emoji: '🌊', name: '모아나', title: '바다를 향한 탐험가', desc: '미지의 세계를 향한 열망과 리더십을 가진 당신은 모아나와 닮았습니다. 자신의 운명을 스스로 개척하며, 어떤 역경에도 포기하지 않는 불굴의 정신이 있습니다.', traits: ['자신의 길을 개척하는 용기', '포기하지 않는 불굴의 정신', '자연과 조화를 이루는 지혜'] },
            belle: { emoji: '📖', name: '벨', title: '지적인 몽상가', desc: '지식에 대한 갈증과 풍부한 상상력을 가진 당신은 벨과 닮았습니다. 겉모습에 속지 않고 본질을 꿰뚫어보는 통찰력이 있으며, 자신만의 세계관이 확고합니다.', traits: ['깊이 있는 지적 호기심', '본질을 꿰뚫어보는 통찰력', '편견 없이 세상을 바라보는 눈'] },
            jasmine: { emoji: '✨', name: '재스민', title: '당당한 자유인', desc: '자신의 의견을 당당하게 말하고 불의에 맞서는 당신은 재스민과 닮았습니다. 높은 자존감과 정의감을 가졌으며, 누구에게도 자신의 인생을 맡기지 않는 독립적인 성격입니다.', traits: ['당당하고 높은 자존감', '불의에 맞서는 정의감', '독립적이고 자주적인 성격'] },
            ariel: { emoji: '🧜', name: '아리엘', title: '호기심의 모험가', desc: '새로운 세계에 대한 끝없는 호기심을 가진 당신은 아리엘과 닮았습니다. 현재에 안주하지 않고 더 넓은 세계를 꿈꾸며, 열정적으로 도전하는 자유로운 영혼입니다.', traits: ['새로운 세계에 대한 끝없는 호기심', '용감한 도전 정신', '열정적이고 자유로운 영혼'] },
            cinderella: { emoji: '👠', name: '신데렐라', title: '인내와 희망의 아이콘', desc: '어떤 시련 속에서도 희망을 잃지 않는 당신은 신데렐라와 닮았습니다. 선한 마음과 인내심으로 결국 꿈을 이루며, 겸손함 속에 빛나는 품격을 가지고 있습니다.', traits: ['시련 속에서도 잃지 않는 희망', '겸손하고 선한 마음씨', '인내로 꿈을 이루는 힘'] },
            merida: { emoji: '🏹', name: '메리다', title: '자유로운 전사', desc: '활을 쏘며 자유롭게 달리는 메리다처럼, 당신은 관습에 얽매이지 않는 야성적 자유인입니다. 자기 운명은 스스로 결정하며, 거친 듯하지만 가족 사랑이 깊은 반전 매력이 있습니다.', traits: ['관습에 얽매이지 않는 자유로움', '스스로 운명을 개척하는 독립심', '거친 외면 속 깊은 가족 사랑'] },
            mirabel: { emoji: '🦋', name: '미라벨', title: '평범 속의 특별함', desc: '특별한 능력 없이도 가족을 하나로 모으는 당신은 미라벨과 닮았습니다. 공감 능력이 뛰어나고, 남들이 보지 못하는 것을 발견하며, 있는 그대로의 자신이 가장 큰 선물임을 알고 있습니다.', traits: ['뛰어난 공감 능력과 관찰력', '가족을 하나로 모으는 힘', '있는 그대로의 나를 사랑하는 마음'] }
        }
    },

    // ============================================================
    // TEST 6: 전생 직업 테스트
    // ============================================================
    {
        id: 'past-life',
        title: '나의 전생 직업은?',
        subtitle: '10가지 질문으로 알아보는 전생의 나',
        emoji: '🔮',
        color: '#8e44ad',
        tag: '전생',
        questionCount: 10,
        resultCount: 10,
        questions: [
            {
                text: '이유 없이 끌리는 장소가 있다면?',
                options: [
                    { text: '고성이나 중세풍 건물', scores: { knight: 3, royal: 1 } },
                    { text: '오래된 서원이나 도서관', scores: { scholar: 3, wizard: 1 } },
                    { text: '바다와 항구', scores: { pirate: 3, explorer: 1 } },
                    { text: '넓은 들판과 농촌 풍경', scores: { farmer: 3, healer: 1 } }
                ]
            },
            {
                text: '본능적으로 잘하는 것이 있다면?',
                options: [
                    { text: '사람을 설득하고 이끄는 것', scores: { royal: 3, merchant: 1 } },
                    { text: '위험을 직감적으로 피하는 것', scores: { ninja: 3, pirate: 1 } },
                    { text: '아픈 사람을 돌보는 것', scores: { healer: 3, farmer: 1 } },
                    { text: '길을 찾거나 방향감각', scores: { explorer: 3, pirate: 1 } }
                ]
            },
            {
                text: '반복되는 꿈이 있다면 어떤 느낌?',
                options: [
                    { text: '전투나 결투 장면', scores: { knight: 3, ninja: 1 } },
                    { text: '이상한 문자나 주문을 외우는 꿈', scores: { wizard: 3, scholar: 1 } },
                    { text: '넓은 바다를 항해하는 꿈', scores: { pirate: 2, explorer: 2 } },
                    { text: '화려한 궁전이나 무도회', scores: { royal: 3, bard: 1 } }
                ]
            },
            {
                text: '위기 상황에서 나의 본능적 반응은?',
                options: [
                    { text: '앞으로 나서서 싸운다', scores: { knight: 3, pirate: 1 } },
                    { text: '은밀하게 빠져나간다', scores: { ninja: 3, merchant: 1 } },
                    { text: '머리를 써서 해결책을 찾는다', scores: { scholar: 2, wizard: 2 } },
                    { text: '사람들을 모아 함께 대응한다', scores: { royal: 2, bard: 2 } }
                ]
            },
            {
                text: '어릴 때 가장 좋아했던 놀이는?',
                options: [
                    { text: '칼싸움, 활쏘기 흉내', scores: { knight: 3, ninja: 1 } },
                    { text: '소꿉놀이, 가게놀이', scores: { merchant: 3, farmer: 1 } },
                    { text: '숨바꼭질, 탐험놀이', scores: { explorer: 3, ninja: 1 } },
                    { text: '노래하고 이야기 만들기', scores: { bard: 3, royal: 1 } }
                ]
            },
            {
                text: '나에게 이상적인 삶의 방식은?',
                options: [
                    { text: '조용히 자연과 함께하는 삶', scores: { farmer: 3, healer: 1 } },
                    { text: '세계를 떠돌며 모험하는 삶', scores: { explorer: 3, pirate: 1 } },
                    { text: '지식을 탐구하고 전파하는 삶', scores: { scholar: 2, wizard: 2 } },
                    { text: '사람들에게 기쁨을 주는 삶', scores: { bard: 3, healer: 1 } }
                ]
            },
            {
                text: '가장 자신 있는 능력은?',
                options: [
                    { text: '체력과 운동 신경', scores: { knight: 2, ninja: 2 } },
                    { text: '말솜씨와 협상력', scores: { merchant: 3, bard: 1 } },
                    { text: '관찰력과 분석력', scores: { scholar: 2, ninja: 2 } },
                    { text: '손재주와 만들기', scores: { farmer: 2, healer: 2 } }
                ]
            },
            {
                text: '이유 없이 끌리는 물건이 있다면?',
                options: [
                    { text: '오래된 검이나 갑옷', scores: { knight: 3, royal: 1 } },
                    { text: '수정 구슬이나 고서적', scores: { wizard: 3, scholar: 1 } },
                    { text: '나침반이나 오래된 지도', scores: { explorer: 3, pirate: 1 } },
                    { text: '악기나 깃펜', scores: { bard: 3, merchant: 1 } }
                ]
            },
            {
                text: '가장 중시하는 덕목은?',
                options: [
                    { text: '명예와 의리', scores: { knight: 3, royal: 1 } },
                    { text: '자유와 모험', scores: { pirate: 3, explorer: 1 } },
                    { text: '지혜와 진실', scores: { scholar: 2, wizard: 2 } },
                    { text: '사랑과 치유', scores: { healer: 3, bard: 1 } }
                ]
            },
            {
                text: '전생의 나에게 한마디 한다면?',
                options: [
                    { text: '"잘 싸웠다, 전사여"', scores: { knight: 2, ninja: 2 } },
                    { text: '"네 지혜는 시대를 넘었다"', scores: { wizard: 2, scholar: 2 } },
                    { text: '"모험은 끝나지 않았다"', scores: { pirate: 2, explorer: 2 } },
                    { text: '"네 노래는 아직 울려퍼진다"', scores: { bard: 2, healer: 2 } }
                ]
            }
        ],
        results: {
            knight: { emoji: '⚔️', name: '기사', title: '명예로운 수호자', desc: '전생의 당신은 왕국을 지키는 충직한 기사였습니다. 강한 정의감과 명예를 소중히 여겼으며, 약자를 위해 검을 들었습니다. 지금도 당신 안에 기사도 정신이 남아 있습니다.', traits: ['정의감과 용기', '약자를 보호하는 본능', '명예와 신의를 중시'] },
            wizard: { emoji: '🧙', name: '마법사', title: '신비한 지혜의 현자', desc: '전생의 당신은 탑에서 별을 읽던 마법사였습니다. 세상의 비밀을 탐구하고 보이지 않는 힘을 다루었으며, 적은 말로도 큰 영향력을 발휘했습니다.', traits: ['신비로운 직감과 통찰력', '깊이 있는 지식 탐구', '말 한마디로 사람을 움직이는 힘'] },
            pirate: { emoji: '🏴‍☠️', name: '해적', title: '자유로운 바다의 모험가', desc: '전생의 당신은 바다를 누비던 자유로운 해적이었습니다. 규칙에 얽매이지 않고 자신만의 법칙으로 살았으며, 동료와의 의리를 목숨보다 소중히 여겼습니다.', traits: ['자유를 향한 열망', '동료와의 깊은 의리', '모험을 두려워하지 않는 용기'] },
            royal: { emoji: '👑', name: '왕족', title: '고귀한 통치자', desc: '전생의 당신은 백성을 다스리던 현명한 왕족이었습니다. 타고난 카리스마와 결단력으로 나라를 이끌었으며, 공정한 판단으로 존경을 받았습니다.', traits: ['타고난 리더십과 카리스마', '공정한 판단력', '책임감과 품위'] },
            scholar: { emoji: '📜', name: '학자', title: '진리를 쫓는 탐구자', desc: '전생의 당신은 서원에서 진리를 탐구하던 학자였습니다. 수많은 책을 읽고 지혜를 나누었으며, 후학들에게 큰 영향을 끼쳤습니다.', traits: ['끝없는 지적 호기심', '체계적 사고와 분석력', '지식을 나누는 교육자 정신'] },
            farmer: { emoji: '🌾', name: '농부', title: '대지의 수호자', desc: '전생의 당신은 대지와 함께 살던 성실한 농부였습니다. 자연의 순환을 이해하고 묵묵히 일하며, 작은 것에서 큰 행복을 찾을 줄 아는 지혜가 있었습니다.', traits: ['성실함과 끈기', '자연과의 조화', '소박한 행복을 아는 지혜'] },
            merchant: { emoji: '💰', name: '상인', title: '실크로드의 거상', desc: '전생의 당신은 대륙을 오가던 수완 좋은 상인이었습니다. 뛰어난 협상력과 눈치로 부를 쌓았으며, 세상 돌아가는 이치를 누구보다 잘 알았습니다.', traits: ['뛰어난 협상력과 소통 능력', '세상 돌아가는 이치를 아는 눈', '기회를 포착하는 감각'] },
            bard: { emoji: '🎵', name: '음유시인', title: '영혼을 노래하는 자', desc: '전생의 당신은 마을을 떠돌며 노래하던 음유시인이었습니다. 음악과 이야기로 사람들의 마음을 움직였으며, 당신이 지나간 곳에는 항상 웃음이 가득했습니다.', traits: ['예술적 감성과 표현력', '사람의 마음을 움직이는 힘', '자유로운 영혼과 낭만'] },
            explorer: { emoji: '🧭', name: '탐험가', title: '미지의 세계를 여는 자', desc: '전생의 당신은 아무도 가지 않은 길을 걸었던 탐험가였습니다. 지도에 없는 곳을 찾아 떠났으며, 두려움보다 호기심이 항상 앞섰습니다.', traits: ['미지의 세계에 대한 호기심', '두려움을 넘는 도전 정신', '뛰어난 적응력과 생존 본능'] },
            ninja: { emoji: '🥷', name: '닌자', title: '그림자 속의 달인', desc: '전생의 당신은 어둠 속에서 임무를 수행하던 닌자였습니다. 뛰어난 관찰력과 민첩함으로 불가능한 일을 해냈으며, 존재하되 보이지 않는 신비한 인물이었습니다.', traits: ['날카로운 관찰력과 직감', '뛰어난 민첩함과 적응력', '은밀하면서도 강한 존재감'] }
        }
    },

    // ============================================================
    // TEST 7: 연애 유형 테스트
    // ============================================================
    {
        id: 'love-style',
        title: '나의 연애 유형은?',
        subtitle: '12가지 질문으로 알아보는 나의 연애 스타일',
        emoji: '💘',
        color: '#e91e63',
        tag: '연애',
        questionCount: 12,
        resultCount: 8,
        questions: [
            {
                text: '썸 타는 상대에게 먼저 연락하는 편?',
                options: [
                    { text: '당연하지! 적극적으로 간다', scores: { passionate: 3, devoted: 1 } },
                    { text: '상대가 먼저 해주길 기다린다', scores: { tsundere: 3, careful: 1 } },
                    { text: '밀당을 적절히 섞는다', scores: { pushpull: 3 } },
                    { text: '좋아하는 감정을 표현하기 어렵다', scores: { shy: 3, independent: 1 } }
                ]
            },
            {
                text: '연인에게 가장 바라는 것은?',
                options: [
                    { text: '로맨틱한 이벤트와 설렘', scores: { romantic: 3, passionate: 1 } },
                    { text: '서로의 자유를 존중하는 것', scores: { independent: 3 } },
                    { text: '흔들리지 않는 신뢰와 안정', scores: { devoted: 3, careful: 1 } },
                    { text: '깊은 대화와 정서적 교감', scores: { soulmate: 3, shy: 1 } }
                ]
            },
            {
                text: '연인과 싸웠을 때 나의 방식은?',
                options: [
                    { text: '바로 이야기해서 풀어야 한다', scores: { passionate: 2, devoted: 2 } },
                    { text: '시간을 두고 차분히 정리한다', scores: { careful: 3, independent: 1 } },
                    { text: '화가 나도 먼저 사과하는 편', scores: { devoted: 3, shy: 1 } },
                    { text: '일단 거리를 두고 머리를 식힌다', scores: { tsundere: 2, independent: 2 } }
                ]
            },
            {
                text: '이상적인 데이트는?',
                options: [
                    { text: '깜짝 이벤트가 있는 특별한 하루', scores: { romantic: 3, passionate: 1 } },
                    { text: '집에서 함께 영화 보며 쉬는 시간', scores: { soulmate: 2, devoted: 2 } },
                    { text: '새로운 곳을 탐험하는 여행 데이트', scores: { passionate: 2, independent: 2 } },
                    { text: '카페에서 깊은 대화를 나누는 시간', scores: { soulmate: 3, careful: 1 } }
                ]
            },
            {
                text: '연인의 이성 친구에 대한 나의 태도는?',
                options: [
                    { text: '신뢰하니까 괜찮다', scores: { independent: 3, soulmate: 1 } },
                    { text: '솔직히 좀 불편하다', scores: { devoted: 2, passionate: 2 } },
                    { text: '질투를 은근히 표현한다', scores: { tsundere: 3, pushpull: 1 } },
                    { text: '나도 모르게 확인하게 된다', scores: { careful: 2, shy: 2 } }
                ]
            },
            {
                text: '좋아하는 사람이 생기면 나는?',
                options: [
                    { text: '온 세상에 티가 난다', scores: { passionate: 3, romantic: 1 } },
                    { text: '그 사람 앞에서만 쿨한 척한다', scores: { tsundere: 3 } },
                    { text: '조용히 관찰하며 다가간다', scores: { careful: 2, shy: 2 } },
                    { text: '친구를 통해 간접적으로 알아본다', scores: { pushpull: 2, shy: 2 } }
                ]
            },
            {
                text: '사랑의 표현 방식은?',
                options: [
                    { text: '말로 직접 "사랑해"라고 한다', scores: { passionate: 2, romantic: 2 } },
                    { text: '행동으로 보여준다 (챙김, 선물)', scores: { devoted: 3, careful: 1 } },
                    { text: '스킨십으로 표현한다', scores: { romantic: 2, passionate: 2 } },
                    { text: '함께하는 시간 자체가 표현', scores: { soulmate: 3, independent: 1 } }
                ]
            },
            {
                text: '연애에서 가장 중요한 것은?',
                options: [
                    { text: '설렘과 두근거림', scores: { romantic: 3, pushpull: 1 } },
                    { text: '서로에 대한 존중', scores: { independent: 2, soulmate: 2 } },
                    { text: '변치 않는 진심', scores: { devoted: 3, careful: 1 } },
                    { text: '함께 성장하는 관계', scores: { soulmate: 3 } }
                ]
            },
            {
                text: '이별 후 나의 모습은?',
                options: [
                    { text: '한동안 힘들지만 빠르게 회복한다', scores: { independent: 3, pushpull: 1 } },
                    { text: '오래 마음속에 남겨두는 편', scores: { devoted: 2, shy: 2 } },
                    { text: '바로 새로운 만남을 시작한다', scores: { passionate: 3 } },
                    { text: '연애 자체를 돌아보며 성찰한다', scores: { careful: 2, soulmate: 2 } }
                ]
            },
            {
                text: '연인과의 미래에 대해?',
                options: [
                    { text: '결혼까지 미리 그려본다', scores: { devoted: 3, romantic: 1 } },
                    { text: '현재를 즐기는 게 중요하다', scores: { passionate: 2, independent: 2 } },
                    { text: '자연스럽게 흘러가는 대로', scores: { soulmate: 2, shy: 2 } },
                    { text: '상대의 생각을 먼저 확인한다', scores: { careful: 3, pushpull: 1 } }
                ]
            },
            {
                text: '연인이 기념일을 잊었다면?',
                options: [
                    { text: '솔직하게 섭섭하다고 말한다', scores: { passionate: 2, devoted: 2 } },
                    { text: '티 안 내고 혼자 속상해한다', scores: { shy: 3, tsundere: 1 } },
                    { text: '삐진 척하다가 풀어준다', scores: { tsundere: 2, pushpull: 2 } },
                    { text: '기념일보다 평소 관심이 중요하다', scores: { independent: 2, soulmate: 2 } }
                ]
            },
            {
                text: '전 연인과 우연히 마주치면?',
                options: [
                    { text: '자연스럽게 인사한다', scores: { independent: 3, soulmate: 1 } },
                    { text: '못 본 척 피한다', scores: { shy: 3, careful: 1 } },
                    { text: '잘 살고 있는 모습을 보여주고 싶다', scores: { tsundere: 2, pushpull: 2 } },
                    { text: '반가운 마음에 긴 대화를 나눈다', scores: { passionate: 2, romantic: 2 } }
                ]
            }
        ],
        results: {
            passionate: { emoji: '🔥', name: '열정파', title: '불꽃 같은 사랑의 전사', desc: '사랑하면 온 세상을 줄 듯 뜨겁게 타오르는 당신! 적극적이고 솔직한 감정 표현으로 상대를 사로잡으며, 연애할 때 가장 빛나는 사람입니다.', traits: ['적극적인 감정 표현', '뜨거운 열정과 에너지', '솔직하고 직진형'] },
            devoted: { emoji: '🤲', name: '헌신파', title: '한결같은 사랑의 수호자', desc: '한 번 사랑하면 끝까지 함께하는 당신은 진정한 헌신의 아이콘입니다. 상대를 위해 기꺼이 양보하며, 변치 않는 마음으로 관계를 지키는 든든한 사랑꾼입니다.', traits: ['변치 않는 한결같음', '상대를 먼저 생각하는 배려', '묵묵하지만 깊은 사랑'] },
            tsundere: { emoji: '😤', name: '츤데레', title: '차가운 겉, 뜨거운 속', desc: '겉으로는 쿨한 척하지만 속으로는 온도계가 폭발하는 당신! 좋아하면서도 티를 안 내는 반전 매력으로, 상대가 당신의 진심을 알아챌 때 가장 설레는 타입입니다.', traits: ['겉과 속이 다른 반전 매력', '사실은 엄청 신경 쓰는 중', '진심을 알아줄 때 최고로 행복'] },
            pushpull: { emoji: '🎭', name: '밀당고수', title: '연애 전략의 달인', desc: '밀고 당기기의 절묘한 균형을 아는 당신! 지루할 틈을 주지 않는 연애 감각으로 상대의 마음을 사로잡으며, 항상 설렘을 유지하는 재주가 있습니다.', traits: ['절묘한 밀당 타이밍', '지루할 틈 없는 연애 감각', '상대의 마음을 읽는 눈치'] },
            romantic: { emoji: '🌹', name: '로맨티스트', title: '영화 같은 사랑을 꿈꾸는', desc: '사랑은 아름다워야 한다고 믿는 당신은 진정한 로맨티스트입니다. 깜짝 이벤트와 감동적인 순간을 만들며, 연인에게 동화 같은 추억을 선물합니다.', traits: ['로맨틱한 이벤트 능력', '감성적이고 섬세한 표현', '사랑에 대한 순수한 동경'] },
            soulmate: { emoji: '💫', name: '소울메이트추구형', title: '영혼의 단짝을 찾는', desc: '외모나 조건보다 영혼의 교감을 중시하는 당신은 깊이 있는 관계를 추구합니다. 서로를 완전히 이해하는 단 한 사람과의 연결을 꿈꾸는 심오한 연애 유형입니다.', traits: ['깊은 정서적 교감 추구', '겉보다 속을 중시', '함께 성장하는 관계 지향'] },
            independent: { emoji: '🦅', name: '독립형', title: '나답게 사랑하는', desc: '연애를 해도 나는 나! 개인의 시간과 공간을 존중하며, 서로의 성장을 응원하는 건강한 연애를 추구합니다. 의존보다 동반자적 관계를 원하는 성숙한 타입입니다.', traits: ['개인 시간과 공간 존중', '의존하지 않는 건강한 관계', '서로의 성장을 응원하는 동반자'] },
            shy: { emoji: '🫣', name: '수줍은 순정파', title: '조용히 사랑하는', desc: '마음은 뜨겁지만 표현은 소극적인 당신은 수줍은 순정파입니다. 한 번 마음을 주면 오래 간직하며, 조용하지만 깊은 사랑을 나누는 섬세한 연애인입니다.', traits: ['소극적이지만 깊은 마음', '한 사람을 오래 마음에 담음', '섬세하고 조용한 사랑 표현'] }
        }
    },

    // ============================================================
    // TEST 8: 음식으로 알아보는 성격
    // ============================================================
    {
        id: 'food-personality',
        title: '음식으로 알아보는 내 성격',
        subtitle: '10가지 질문으로 찾는 나의 소울 푸드',
        emoji: '🍽️',
        color: '#f39c12',
        tag: '음식',
        questionCount: 10,
        resultCount: 8,
        questions: [
            {
                text: '금요일 퇴근 후 가장 끌리는 메뉴는?',
                options: [
                    { text: '매콤한 떡볶이에 소주 한잔', scores: { tteokbokki: 3, chicken: 1 } },
                    { text: '고급 스시 오마카세', scores: { sushi: 3, steak: 1 } },
                    { text: '따뜻한 김치찌개 한 뚝배기', scores: { kimchi: 3 } },
                    { text: '치킨에 맥주! 치맥이 진리', scores: { chicken: 3, pizza: 1 } }
                ]
            },
            {
                text: '여행지에서 음식을 고를 때?',
                options: [
                    { text: '현지 로컬 맛집을 꼭 찾아간다', scores: { ramen: 2, sushi: 2 } },
                    { text: '익숙한 한국 음식이 그립다', scores: { kimchi: 3, tteokbokki: 1 } },
                    { text: '이색적인 퓨전 메뉴를 시도한다', scores: { pasta: 3, pizza: 1 } },
                    { text: '맛집 리뷰 1등을 무조건 간다', scores: { steak: 2, chicken: 2 } }
                ]
            },
            {
                text: '나의 식사 스타일은?',
                options: [
                    { text: '빨리빨리! 효율적으로 먹는다', scores: { ramen: 3, tteokbokki: 1 } },
                    { text: '분위기와 플레이팅도 중요하다', scores: { pasta: 3, sushi: 1 } },
                    { text: '양이 많아야 행복하다', scores: { chicken: 2, pizza: 2 } },
                    { text: '함께 나눠 먹는 게 최고', scores: { kimchi: 2, pizza: 2 } }
                ]
            },
            {
                text: '스트레스 받을 때 찾는 음식은?',
                options: [
                    { text: '얼큰하고 매운 것', scores: { tteokbokki: 3, kimchi: 1 } },
                    { text: '달달한 디저트', scores: { pasta: 2, pizza: 2 } },
                    { text: '든든한 고기류', scores: { steak: 3, chicken: 1 } },
                    { text: '뜨끈한 국물 요리', scores: { ramen: 3, kimchi: 1 } }
                ]
            },
            {
                text: '친구가 "뭐 먹을래?" 물으면?',
                options: [
                    { text: '"아무거나~" (진짜 다 괜찮음)', scores: { kimchi: 2, ramen: 2 } },
                    { text: '이미 먹고 싶은 게 정해져 있다', scores: { sushi: 2, steak: 2 } },
                    { text: '"가성비 좋은 데 가자!"', scores: { tteokbokki: 2, chicken: 2 } },
                    { text: '"새로 생긴 데 가보자!"', scores: { pasta: 2, pizza: 2 } }
                ]
            },
            {
                text: '요리할 때 나의 스타일은?',
                options: [
                    { text: '레시피를 정확히 따른다', scores: { sushi: 3, pasta: 1 } },
                    { text: '냉장고에 있는 걸로 즉흥 요리', scores: { kimchi: 3, ramen: 1 } },
                    { text: '요리보다 배달이 편하다', scores: { chicken: 3, pizza: 1 } },
                    { text: '불 앞에서 고기 굽는 게 최고', scores: { steak: 3, tteokbokki: 1 } }
                ]
            },
            {
                text: '음식 사진을 찍는 편?',
                options: [
                    { text: '당연하지! SNS 필수', scores: { pasta: 3, sushi: 1 } },
                    { text: '가끔 맛있는 것만', scores: { steak: 2, ramen: 2 } },
                    { text: '사진보다 빨리 먹는 게 우선', scores: { ramen: 3, chicken: 1 } },
                    { text: '안 찍는다. 먹는 데 집중!', scores: { kimchi: 2, tteokbokki: 2 } }
                ]
            },
            {
                text: '무인도에 음식 하나만 가져간다면?',
                options: [
                    { text: '밥과 김치', scores: { kimchi: 3 } },
                    { text: '라면 박스', scores: { ramen: 3 } },
                    { text: '피자 무한 공급', scores: { pizza: 3 } },
                    { text: '고기와 그릴', scores: { steak: 3 } }
                ]
            },
            {
                text: '음식에서 가장 중요한 것은?',
                options: [
                    { text: '맛이 최우선!', scores: { tteokbokki: 2, steak: 2 } },
                    { text: '신선한 재료와 품질', scores: { sushi: 3, pasta: 1 } },
                    { text: '가성비가 중요하다', scores: { chicken: 2, ramen: 2 } },
                    { text: '함께 먹는 사람이 중요', scores: { kimchi: 2, pizza: 2 } }
                ]
            },
            {
                text: '나를 음식에 비유한다면?',
                options: [
                    { text: '자극적이고 중독성 있는 매운맛', scores: { tteokbokki: 3, ramen: 1 } },
                    { text: '고급스럽고 세련된 코스요리', scores: { sushi: 2, steak: 2 } },
                    { text: '언제 먹어도 편안한 집밥', scores: { kimchi: 3, chicken: 1 } },
                    { text: '다양하고 재미있는 퓨전 요리', scores: { pasta: 2, pizza: 2 } }
                ]
            }
        ],
        results: {
            tteokbokki: { emoji: '🌶️', name: '떡볶이', title: '자극적 매력의 인싸', desc: '매콤달콤 중독성 있는 떡볶이처럼, 당신은 한번 알면 빠져나올 수 없는 매력의 소유자입니다. 감정 표현이 솔직하고 주변을 활기차게 만드는 에너자이저입니다.', traits: ['중독성 있는 매력', '솔직한 감정 표현', '주변을 활기차게 만드는 에너지'] },
            sushi: { emoji: '🍣', name: '스시', title: '섬세한 완벽주의자', desc: '정갈하고 섬세한 스시처럼, 당신은 모든 일에 완벽을 추구하는 세심한 사람입니다. 겉으로는 차분해 보이지만 내면에 깊은 맛이 있는 매력적인 사람입니다.', traits: ['섬세한 완벽주의', '차분하지만 깊이 있는 내면', '품격 있는 취향'] },
            kimchi: { emoji: '🥘', name: '김치찌개', title: '따뜻한 국민 힐러', desc: '언제 먹어도 편안한 김치찌개처럼, 당신은 누구에게나 편안함을 주는 따뜻한 사람입니다. 화려하지 않지만 없으면 허전한, 모두에게 꼭 필요한 존재입니다.', traits: ['누구에게나 편안한 존재', '변치 않는 따뜻한 마음', '없으면 허전한 필수 존재'] },
            chicken: { emoji: '🍗', name: '치킨', title: '모두가 사랑하는 인기인', desc: '남녀노소 모두가 사랑하는 치킨처럼, 당신은 어디서든 환영받는 인기인입니다. 가볍고 유쾌한 성격으로 어떤 모임에서도 빠질 수 없는 핵심 인물입니다.', traits: ['누구에게나 사랑받는 성격', '가볍고 유쾌한 매력', '어디서든 환영받는 인기인'] },
            pasta: { emoji: '🍝', name: '파스타', title: '감성적 트렌드세터', desc: '다양한 소스로 변신하는 파스타처럼, 당신은 창의적이고 트렌디한 감성의 소유자입니다. 새로운 것을 받아들이는 데 거부감이 없고, 자신만의 스타일이 확실합니다.', traits: ['창의적이고 트렌디한 감성', '변화를 두려워하지 않는 유연함', '자신만의 스타일이 확실함'] },
            ramen: { emoji: '🍜', name: '라멘', title: '열정 넘치는 행동파', desc: '뜨겁고 깊은 맛의 라멘처럼, 당신은 열정적이고 한 번 빠지면 끝까지 파고드는 사람입니다. 빠른 실행력으로 결과를 만들어내며, 뜨거운 에너지로 주변을 감동시킵니다.', traits: ['뜨거운 열정과 에너지', '한 번 시작하면 끝까지', '빠른 실행력의 행동파'] },
            pizza: { emoji: '🍕', name: '피자', title: '다재다능한 소셜러', desc: '다양한 토핑으로 모두를 만족시키는 피자처럼, 당신은 어떤 상황에서든 적응하는 다재다능한 소셜러입니다. 함께 나눌 때 가장 행복하며, 파티의 중심에 항상 당신이 있습니다.', traits: ['다재다능한 적응력', '함께 나눌 때 가장 행복한 사람', '파티와 모임의 핵심 인물'] },
            steak: { emoji: '🥩', name: '스테이크', title: '당당한 실력파', desc: '묵직한 존재감의 스테이크처럼, 당신은 실력과 자신감으로 인정받는 사람입니다. 겉으로 드러나는 화려함보다 내실을 중시하며, 자기 분야에서 최고를 추구합니다.', traits: ['묵직한 존재감과 자신감', '내실을 중시하는 실력파', '자기 분야에서 최고 추구'] }
        }
    }
];
